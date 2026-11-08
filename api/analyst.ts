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
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash';

  if (!apiKey) {
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

  try {
    // Official Gemini generateContent REST endpoint
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    const upstreamResponse = await fetch(endpoint, {
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
          temperature: 0.3,
        },
      }),
    });

    if (!upstreamResponse.ok) {
      return respond(res, 502, { error: 'Upstream AI model request failed' });
    }

    const data: any = await upstreamResponse.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof candidateText !== 'string') {
      return respond(res, 502, { error: 'No response content returned from model' });
    }

    // Parse model output JSON
    let parsed: any;
    try {
      const cleaned = candidateText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
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
      return respond(res, 502, { error: 'Model output failed schema validation' });
    }

    return respond(res, 200, {
      pick: parsed.pick,
      why: parsed.why.trim(),
    });
  } catch {
    return respond(res, 502, { error: 'Error processing live analyst prediction' });
  }
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
