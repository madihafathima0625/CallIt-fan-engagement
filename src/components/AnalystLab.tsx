import { useState, useEffect, useRef } from 'react';
import type { Level } from '../data/match';

interface AnalystLabProps {
  level: Level;
  initialTab?: 'scenario' | 'chat';
  matchContext: string;
  onBack: () => void;
}

interface ScenarioResult {
  prediction: string;
  why: string;
  confidence: 'low' | 'medium' | 'high';
  isOfflineExample?: boolean;
}

interface ChatMessage {
  role: 'user' | 'analyst';
  text: string;
  source?: 'live' | 'offline';
  isError?: boolean;
}

const EXAMPLE_CHIPS = [
  {
    title: 'Last over, 8 needed, set batter on strike',
    offline: {
      newcomer: {
        prediction: 'The batting team will hit the winning runs with balls to spare.',
        why: '8 runs off 6 balls with a settled batter puts all the pressure on the bowler.',
        confidence: 'high' as const,
      },
      pro: {
        prediction: 'Chasing side finishes the match within 4 to 5 deliveries.',
        why: 'Required rate of 8.0 with a set batter facing death field restrictions yields heavy statistical chase bias.',
        confidence: 'high' as const,
      },
    },
  },
  {
    title: 'Spinner bowling to a new batter in the powerplay',
    offline: {
      newcomer: {
        prediction: 'A quiet over with singles or a quick wicket falling.',
        why: 'A fresh batter needs time to adjust to spin, so swinging aggressively is very risky.',
        confidence: 'medium' as const,
      },
      pro: {
        prediction: 'High dot-ball percentage or an attacking dismissal inside the ring.',
        why: 'Taking pace off forces the incoming batter to generate power against turn, risking top-edges.',
        confidence: 'medium' as const,
      },
    },
  },
  {
    title: 'Rain delay with the chasing team behind',
    offline: {
      newcomer: {
        prediction: 'The bowling team wins if no more play is possible.',
        why: 'Target calculations penalize teams that fall behind the required run rate before the rain.',
        confidence: 'high' as const,
      },
      pro: {
        prediction: 'Defending side retains DLS parity advantage unless overs are drastically reduced.',
        why: 'DLS curve heavily discounts chasing teams behind par when losing wickets ahead of rain stoppages.',
        confidence: 'high' as const,
      },
    },
  },
];

export function AnalystLab({
  level,
  initialTab = 'scenario',
  matchContext,
  onBack,
}: AnalystLabProps) {
  const [tab, setTab] = useState<'scenario' | 'chat'>(initialTab);

  // Scenario Tab State
  const [scenarioText, setScenarioText] = useState('');
  const [scenarioHint, setScenarioHint] = useState<string | null>(null);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [scenarioResult, setScenarioResult] = useState<ScenarioResult | null>(null);
  const [scenarioError, setScenarioError] = useState(false);

  // Chat Tab State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'analyst',
      text:
        level === 'newcomer'
          ? "Hey there! I'm your CallIt match analyst. Ask me anything about this game or cricket basics!"
          : "Welcome to the Lab! Ready to break down tactics, pitch conditions, and chase dynamics. What's on your mind?",
      source: 'offline',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatCooldown, setChatCooldown] = useState(0);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  const isOfflineForced =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('offline') === '1';

  // Handle Chat 3-second cooldown timer
  useEffect(() => {
    if (chatCooldown <= 0) return;
    const timer = setInterval(() => {
      setChatCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [chatCooldown]);

  // Submit Scenario
  const handleAskScenario = async (textToAsk = scenarioText) => {
    const trimmed = textToAsk.trim();
    if (!trimmed || scenarioLoading) return;

    // Hint if shorter than 15 characters instead of calling the API
    if (trimmed.length < 15) {
      setScenarioHint('Describe the situation in a bit more detail');
      return;
    }

    setScenarioHint(null);
    setScenarioLoading(true);
    setScenarioError(false);
    setScenarioResult(null);

    // Check if the query matches an example chip for offline fallback
    const matchedChip = EXAMPLE_CHIPS.find(
      (c) => c.title.toLowerCase() === trimmed.toLowerCase()
    );

    if (isOfflineForced) {
      if (matchedChip) {
        setScenarioResult({
          ...matchedChip.offline[level],
          isOfflineExample: true,
        });
      } else {
        setScenarioResult({
          prediction: 'Tactical stalemate likely.',
          why: 'In offline mode, preset scenario examples provide verified predictions.',
          confidence: 'medium',
          isOfflineExample: true,
        });
      }
      setScenarioLoading(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7500);

      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'scenario',
          level,
          text: trimmed.slice(0, 300),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error('API failure');
      const data = await res.json();
      if (data.prediction && data.why && data.confidence) {
        setScenarioResult({
          prediction: data.prediction,
          why: data.why,
          confidence: data.confidence,
          isOfflineExample: false,
        });
      } else {
        throw new Error('Invalid structure');
      }
    } catch {
      // Fallback: If this matches an example chip, show the pre-written answer with "OFFLINE EXAMPLE"
      if (matchedChip) {
        setScenarioResult({
          ...matchedChip.offline[level],
          isOfflineExample: true,
        });
      } else {
        setScenarioError(true);
      }
    } finally {
      setScenarioLoading(false);
    }
  };

  // Submit Chat Message
  const handleSendChat = async (overrideText?: string) => {
    const textToSend = (overrideText || chatInput).trim();
    if (!textToSend || chatLoading || chatCooldown > 0) return;

    // Append user message
    const updatedMessages: ChatMessage[] = [
      ...chatMessages,
      { role: 'user', text: textToSend.slice(0, 300) },
    ];
    setChatMessages(updatedMessages);
    if (!overrideText) setChatInput('');
    setChatLoading(true);
    setChatCooldown(3); // 3-second cooldown
    setLastFailedMessage(null);

    // Keep last 6 messages as history
    const historyPayload = updatedMessages.slice(-6).map((m) => ({
      role: m.role,
      text: m.text.slice(0, 300),
    }));

    if (isOfflineForced) {
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'analyst',
            text: "I'm currently in offline mode (?offline=1). Feel free to explore the Scenario tab for pre-cached match analyses!",
            source: 'offline',
          },
        ]);
        setChatLoading(false);
      }, 400);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7500);

      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'chat',
          level,
          text: textToSend.slice(0, 300),
          history: historyPayload,
          matchContext: matchContext.slice(0, 600),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error('Chat API failure');
      const data = await res.json();
      if (typeof data.reply === 'string' && data.reply.trim().length > 0) {
        setChatMessages((prev) => [
          ...prev,
          { role: 'analyst', text: data.reply.trim(), source: 'live' },
        ]);
      } else {
        throw new Error('Invalid chat response');
      }
    } catch {
      setLastFailedMessage(textToSend);
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'analyst',
          text: 'The analyst is offline right now.',
          source: 'offline',
          isError: true,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-5 pt-1 pb-10">
      {/* Header with Back Button */}
      <header className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
        >
          <svg className="w-4 h-4 text-[#C6FF3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#C6FF3D] flex items-center justify-center font-black text-[#0B1220]">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
            </svg>
          </div>
          <span className="text-base font-black tracking-tight text-white uppercase italic">
            Analyst <span className="text-[#C6FF3D]">Lab</span>
          </span>
        </div>

        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[#C6FF3D]">
          {level}
        </span>
      </header>

      {/* Two Tabs Selector */}
      <nav className="grid grid-cols-2 gap-2 bg-[#10192A] p-1 rounded-xl border border-slate-800" aria-label="Analyst Lab Tabs">
        <button
          type="button"
          onClick={() => setTab('scenario')}
          className={`py-2 px-3 rounded-lg text-xs font-extrabold uppercase tracking-wider transition cursor-pointer ${
            tab === 'scenario'
              ? 'bg-[#182642] text-[#C6FF3D] shadow-sm border border-[#C6FF3D]/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Your Own Scenario
        </button>
        <button
          type="button"
          onClick={() => setTab('chat')}
          className={`py-2 px-3 rounded-lg text-xs font-extrabold uppercase tracking-wider transition cursor-pointer ${
            tab === 'chat'
              ? 'bg-[#182642] text-[#C6FF3D] shadow-sm border border-[#C6FF3D]/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Ask the Analyst
        </button>
      </nav>

      {/* TAB 1: YOUR OWN SCENARIO */}
      {tab === 'scenario' && (
        <section className="space-y-4">
          <div className="bg-[#121B2F] border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-300">
                Custom Match Scenario
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {scenarioText.length}/300
              </span>
            </div>

            <textarea
              rows={3}
              maxLength={300}
              value={scenarioText}
              onChange={(e) => {
                setScenarioText(e.target.value);
                if (scenarioHint && e.target.value.trim().length >= 15) {
                  setScenarioHint(null);
                }
              }}
              placeholder="Describe a match situation, e.g. 'Last over, 8 needed, set batter on strike'"
              className="w-full bg-[#0B1220] border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#C6FF3D] resize-none transition"
            />

            {/* Hint if shorter than 15 characters */}
            {scenarioHint && (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-xs text-amber-200 flex items-center gap-2 font-medium animate-fade-in">
                <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{scenarioHint}</span>
              </div>
            )}

            <button
              type="button"
              disabled={scenarioLoading || !scenarioText.trim()}
              onClick={() => handleAskScenario()}
              className="w-full py-3 px-4 rounded-xl bg-[#C6FF3D] hover:bg-[#b5f526] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B1220] font-black text-sm uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_2px_15px_rgba(198,255,61,0.25)]"
            >
              {scenarioLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0B1220] border-t-transparent rounded-full animate-spin" />
                  Analyzing Scenario...
                </>
              ) : (
                'Ask the Analyst'
              )}
            </button>
          </div>

          {/* Example Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Quick Test Scenarios:
            </span>
            <div className="flex flex-col gap-2">
              {EXAMPLE_CHIPS.map((chip) => (
                <button
                  key={chip.title}
                  type="button"
                  onClick={() => {
                    setScenarioText(chip.title);
                    setScenarioHint(null);
                    handleAskScenario(chip.title);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-[#10192A] hover:bg-[#16233B] border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition cursor-pointer flex items-center justify-between group"
                >
                  <span className="leading-snug pr-2">{chip.title}</span>
                  <span className="shrink-0 text-[10px] font-mono text-[#C6FF3D] group-hover:translate-x-0.5 transition-transform">
                    &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Result Card */}
          {scenarioResult && (
            <div className="rounded-2xl bg-gradient-to-b from-[#182642] to-[#10192A] p-4 border border-[#C6FF3D]/40 space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase font-bold text-white tracking-wider">
                    Analyst Prediction
                  </span>
                  {/* Badge: LIVE AI (lime) or OFFLINE EXAMPLE (grey) */}
                  {scenarioResult.isOfflineExample ? (
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      OFFLINE EXAMPLE
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C6FF3D] bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF3D] animate-pulse" />
                      LIVE AI
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] font-mono uppercase font-black px-2 py-0.5 rounded ${
                    scenarioResult.confidence === 'high'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : scenarioResult.confidence === 'medium'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {scenarioResult.confidence} confidence
                </span>
              </div>

              <div>
                {/* Prediction text without quotation marks */}
                <p className="text-base font-extrabold text-white leading-snug">
                  {scenarioResult.prediction}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed mt-2 pt-2 border-t border-slate-800/80">
                  <strong className="text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">
                    Tactical Reasoning:
                  </strong>
                  {scenarioResult.why}
                </p>
              </div>
            </div>
          )}

          {/* Error Message with Retry */}
          {scenarioError && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center justify-between text-xs text-rose-200">
              <span>The analyst is offline right now.</span>
              <button
                type="button"
                onClick={() => handleAskScenario()}
                className="px-3 py-1 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-white font-bold transition cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}
        </section>
      )}

      {/* TAB 2: ASK THE ANALYST (CHAT) */}
      {tab === 'chat' && (
        <section className="flex flex-col gap-3">
          {/* Match Context Pill */}
          <div className="bg-[#10192A] border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="truncate pr-2 font-mono">{matchContext}</span>
            <span className="shrink-0 text-[10px] font-bold uppercase text-[#C6FF3D]">Context</span>
          </div>

          {/* Chat Messages Container */}
          <div className="h-64 overflow-y-auto space-y-2.5 p-3 rounded-2xl bg-[#0E1626] border border-slate-800">
            {chatMessages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#182642] border border-[#C6FF3D]/30 text-white'
                        : msg.isError
                        ? 'bg-rose-950/40 border border-rose-800/60 text-rose-200'
                        : 'bg-[#121B2F] border border-slate-700/60 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {isUser ? 'You' : 'Analyst'}
                      </span>
                      {/* Badge on chat reply: LIVE AI (lime) or OFFLINE EXAMPLE (grey) */}
                      {!isUser && !msg.isError && (
                        msg.source === 'live' ? (
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#C6FF3D] bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-[#C6FF3D] animate-pulse" />
                            LIVE AI
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 border border-slate-700 px-1.5 py-0.5 rounded-full">
                            OFFLINE EXAMPLE
                          </span>
                        )
                      )}
                    </div>
                    <p>{msg.text}</p>
                    {msg.isError && lastFailedMessage && (
                      <button
                        type="button"
                        onClick={() => handleSendChat(lastFailedMessage)}
                        className="mt-2 text-[11px] font-bold underline text-rose-300 hover:text-white transition cursor-pointer"
                      >
                        Retry message
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {chatLoading && (
              <div className="flex items-start">
                <div className="rounded-2xl p-3 bg-[#121B2F] border border-slate-700/60 text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C6FF3D] animate-ping" />
                  <span>Analyst is typing...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input & Send */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              maxLength={300}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about this over, tactics, or cricket rules..."
              className="flex-1 bg-[#121B2F] border border-slate-700 rounded-xl px-3.5 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#C6FF3D] transition"
            />
            <button
              type="submit"
              disabled={chatLoading || chatCooldown > 0 || !chatInput.trim()}
              className="py-3 px-4 rounded-xl bg-[#C6FF3D] hover:bg-[#b5f526] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B1220] font-black text-xs uppercase tracking-wider transition cursor-pointer shrink-0"
            >
              {chatCooldown > 0 ? `Wait ${chatCooldown}s` : 'Send'}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
