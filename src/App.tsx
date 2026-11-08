import { useState } from 'react';
import { matchInfo, moments, type Level } from './data/match';
import { Zap, ShieldCheck, Flame, Trophy, Play, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [level, setLevel] = useState<Level>('newcomer');
  const [kickedOff, setKickedOff] = useState(false);

  const firstMoment = moments[0];

  const handleKickOff = () => {
    setKickedOff(true);
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 flex flex-col items-center justify-start p-4 sm:p-6 selection:bg-[#C6FF3D] selection:text-[#0B1220]">
      {/* Mobile-first Container */}
      <main className="w-full max-w-md mx-auto flex flex-col gap-6 pt-2 pb-10">
        
        {/* Top Brand Bar */}
        <header className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#C6FF3D] flex items-center justify-center font-black text-[#0B1220] shadow-[0_0_20px_rgba(198,255,61,0.35)]">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase italic leading-none">
                Call<span className="text-[#C6FF3D]">It</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C6FF3D]/80">
                Live Fan Engagement
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
            <span className="inline-block w-2 h-2 rounded-full bg-[#C6FF3D] animate-pulse" />
            <span>T20 LIVE</span>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 text-[#C6FF3D] text-xs font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" />
            Interactive Match Experience
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Predict the next play. <br />
            <span className="text-[#C6FF3D]">Beat the Analyst.</span>
          </h2>
          <p className="text-sm text-slate-400 max-w-xs mx-auto">
            Test your cricket instincts in real-time as key match moments unfold ball by ball.
          </p>
        </section>

        {/* Match Info Card */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#16233B] to-[#0F192C] p-5 border border-slate-700/60 shadow-xl">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-[#C6FF3D]/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-3">
            <span className="uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-[#C6FF3D]" /> Match Fixture
            </span>
            <span className="text-slate-400 font-mono text-[11px] bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
              7 Key Moments
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-white tracking-wide">
              {matchInfo.title}
            </h3>
            <div className="p-3 rounded-xl bg-[#0B1220]/80 border border-slate-800 flex items-start gap-2.5">
              <div className="mt-0.5 p-1 rounded-md bg-[#C6FF3D]/10 text-[#C6FF3D]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Target & Situation</p>
                <p className="text-sm font-semibold text-slate-200 mt-0.5">
                  {matchInfo.format}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Level Selector */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
              Choose Your Knowledge Level
            </span>
            <span className="text-[11px] font-semibold text-[#C6FF3D] uppercase">
              Current: {level}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Knowledge Level">
            {/* Newcomer Button */}
            <button
              type="button"
              onClick={() => setLevel('newcomer')}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left ${
                level === 'newcomer'
                  ? 'bg-[#182642] border-[#C6FF3D] shadow-[0_0_15px_rgba(198,255,61,0.2)]'
                  : 'bg-[#10192A] border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              {level === 'newcomer' && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C6FF3D] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C6FF3D]"></span>
                </span>
              )}
              <span className={`text-base font-extrabold tracking-wide ${level === 'newcomer' ? 'text-white' : 'text-slate-300'}`}>
                Newcomer
              </span>
              <span className={`text-xs mt-1 text-center leading-snug ${level === 'newcomer' ? 'text-[#C6FF3D]' : 'text-slate-500'}`}>
                Plain-English terms &amp; helpful guides
              </span>
            </button>

            {/* Pro Button */}
            <button
              type="button"
              onClick={() => setLevel('pro')}
              className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left ${
                level === 'pro'
                  ? 'bg-[#182642] border-[#C6FF3D] shadow-[0_0_15px_rgba(198,255,61,0.2)]'
                  : 'bg-[#10192A] border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              {level === 'pro' && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C6FF3D] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C6FF3D]"></span>
                </span>
              )}
              <span className={`text-base font-extrabold tracking-wide ${level === 'pro' ? 'text-white' : 'text-slate-300'}`}>
                Pro
              </span>
              <span className={`text-xs mt-1 text-center leading-snug ${level === 'pro' ? 'text-[#C6FF3D]' : 'text-slate-500'}`}>
                Tactical depth, fielding &amp; analytics
              </span>
            </button>
          </div>
        </section>

        {/* Kick Off Action */}
        <section className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleKickOff}
            className="w-full py-4 px-6 rounded-xl bg-[#C6FF3D] hover:bg-[#b5f526] active:scale-[0.99] text-[#0B1220] font-black text-lg tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(198,255,61,0.35)] cursor-pointer"
          >
            <Play className="w-5 h-5 fill-[#0B1220]" />
            Kick off
          </button>

          {kickedOff && (
            <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 text-xs font-semibold text-[#C6FF3D] text-center animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Kick off initiated with <strong>{level.toUpperCase()}</strong> difficulty! (Step 1 complete)</span>
            </div>
          )}
        </section>

        {/* Data Verification Box (Temporary Preview) */}
        <section className="mt-4 p-4 rounded-xl bg-[#0e1626] border border-dashed border-[#C6FF3D]/40 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#C6FF3D] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C6FF3D]" />
              Data Verification Preview
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              Moment #1
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">
              {firstMoment.over} &bull; {firstMoment.score}
            </span>
            <span className="font-mono text-[11px] uppercase text-[#C6FF3D] bg-[#C6FF3D]/10 px-2 py-0.5 rounded font-bold">
              Level: {level}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#141F35] border border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Situation ({level})
            </div>
            <p className="text-sm font-medium text-slate-200 leading-relaxed">
              "{firstMoment.situation[level]}"
            </p>
          </div>

          <div className="text-[11px] text-slate-500 italic text-center">
            Toggle between Newcomer and Pro above to see the situation text change dynamically.
          </div>
        </section>

      </main>
    </div>
  );
}
