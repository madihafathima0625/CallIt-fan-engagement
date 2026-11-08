export default async function handler(req: any, res: any) {
  // Enforce POST method
  if (req.method !== 'POST') {
    return respond(res, 405, { error: 'Method Not Allowed' });
  }

  // Parse incoming JSON body safely
  const body = await parseRequestBody(req);
  if (!body || typeof body !== 'object') {
    return respond(res, 400, { error: 'Missing or invalid JSON request body' });
  }

  // Extract permitted fields ONLY (never receive or use outcome or correct answer)
  const { situation, question, options, level } = body;

  // Validate missing fields
  if (
    typeof situation !== 'string' ||
    typeof question !== 'string' ||
    !Array.isArray(options) ||
    options.length !== 3 ||
    (level !== 'newcomer' && level !== 'pro')
  ) {
    return respond(res, 400, {
      error: 'Invalid request: must provide situation, question, 3 options, and level ("newcomer" | "pro")',
    });
  }

  // Reject oversized text (over 500 characters per field)
  if (situation.length > 500 || question.length > 500) {
    return respond(res, 400, {
      error: 'Situation or question exceeds 500 characters limit',
    });
  }

  for (const opt of options) {
    if (typeof opt !== 'string' || opt.length > 500) {
      return respond(res, 400, {
        error: 'Each option must be a string of 500 characters or fewer',
      });
    }
  }

  // Read environment variables (never log or return key)
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  let model = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';
  // Map deprecated gemini-2.5-flash-lite to supported gemini-3.5-flash-lite
  if (model === 'gemini-2.5-flash-lite') {
    model = 'gemini-3.5-flash-lite';
  }

  if (!apiKey) {
    console.error('[analyst] Failure at stage: server configuration. API key missing.');
    return respond(res, 500, { error: 'Server configuration error' });
  }

  // Build analyst prompt for Gemini
  const styleInstruction =
    level === 'newcomer'
      ? 'Use simple, friendly language with no technical jargon so a casual fan easily understands.'
      : 'Use tactical cricket terminology, match situation awareness, and strategic fielding/bowling analysis.';

  const prompt = `You are a friendly cricket match analyst giving a live prediction during a match.

Fan knowledge level: ${level}
Tone & style: ${styleInstruction}

Current Match Situation:
"${situation}"

Question:
"${question}"

Available Options:
0: ${options[0]}
1: ${options[1]}
2: ${options[2]}

Instructions:
1. Pick exactly one option index (0, 1, or 2).
2. Give a short, engaging reason for your pick (maximum 25 words).
3. Return ONLY a valid JSON object matching this schema:
{"pick": 0|1|2, "why": "string under 25 words"}`;

  // Configure thinking for minimal or off to reduce latency
  const thinkingConfig = model.includes('2.5')
    ? { thinkingBudget: 0 }
    : { thinkingLevel: 'minimal' };

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  // 7-second timeout for upstream Gemini fetch
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 7000);

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey, // Key sent strictly via header, never in URL
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: 120,
          temperature: 0.4,
          thinkingConfig,
        },
      }),
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (controller.signal.aborted) {
      console.error('[analyst] Failure at stage: upstream request. Reason: timeout (exceeded 7 seconds)');
      return respond(res, 504, { error: 'timeout' });
    }
    console.error('[analyst] Failure at stage: upstream request.', err?.message || String(err));
    return respond(res, 502, { error: 'Upstream AI model request failed' });
  }

  clearTimeout(timeoutId);

  // Upstream status failure logging
  if (!upstreamResponse.ok) {
    const errorBody = (await upstreamResponse.text().catch(() => '')).slice(0, 200);
    console.error(
      `[analyst] Failure at stage: upstream status. HTTP status: ${upstreamResponse.status}. Body: ${errorBody}`
    );
    return respond(res, 502, { error: 'Upstream AI model request failed' });
  }

  let data: any;
  let candidateText: string | undefined;
  try {
    data = await upstreamResponse.json();
    candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof candidateText !== 'string') {
      throw new Error('No text parts in candidate response');
    }
  } catch (err: any) {
    console.error('[analyst] Failure at stage: JSON parse (upstream response).', err?.message || String(err));
    return respond(res, 502, { error: 'Failed to parse upstream AI response' });
  }

  // Parse model output JSON
  let parsed: any;
  try {
    const cleaned = candidateText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (err: any) {
    console.error('[analyst] Failure at stage: JSON parse (model output text).', err?.message || String(err));
    return respond(res, 502, { error: 'Model output is not valid JSON' });
  }

  // Validate the model's output:
  // pick must be 0, 1 or 2
  // why must be a non-empty string under 200 characters
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof parsed.pick !== 'number' ||
    !Number.isInteger(parsed.pick) ||
    ![0, 1, 2].includes(parsed.pick) ||
    typeof parsed.why !== 'string' ||
    parsed.why.trim().length === 0 ||
    parsed.why.length >= 200
  ) {
    console.error('[analyst] Failure at stage: validation. Invalid pick or why format in model output.');
    return respond(res, 502, { error: 'Model output failed schema validation' });
  }

  return respond(res, 200, {
    pick: parsed.pick,
    why: parsed.why.trim(),
  });
}

async function parseRequestBody(req: any): Promise<any> {
  if (req.body) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return null;
      }
    }
    return req.body;
  }

  if (typeof req.json === 'function') {
    try {
      return await req.json();
    } catch {
      return null;
    }
  }

  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk: any) => {
      raw += chunk;
      if (raw.length > 20000) {
        resolve(null);
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
  });
}

function respond(res: any, status: number, data: any) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(status).json(data);
  }
  if (res.statusCode !== undefined && typeof res.setHeader === 'function' && typeof res.end === 'function') {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(data));
  }
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
