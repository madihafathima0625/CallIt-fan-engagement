import { matchInfo, type Level } from '../data/match';

interface StartScreenProps {
  level: Level;
  onSelectLevel: (level: Level) => void;
  onStartMatch: () => void;
  onOpenLab: () => void;
}

export function StartScreen({ level, onSelectLevel, onStartMatch, onOpenLab }: StartScreenProps) {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6 pt-2 pb-10">
      {/* Top Brand Bar */}
      <header className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#C6FF3D] flex items-center justify-center font-black text-[#0B1220] shadow-[0_0_20px_rgba(198,255,61,0.35)]">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
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
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2c1.1 0 2 .9 2 2 0 .74-.4 1.38-1 1.72v1.56c2.83.48 5 2.94 5 5.92 0 3.31-2.69 6-6 6s-6-2.69-6-6c0-2.98 2.17-5.44 5-5.92V5.72C9.4 5.38 9 4.74 9 4c0-1.1.9-2 2-2h1z" />
          </svg>
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
          <span className="uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-[#C6FF3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Match Fixture
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
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
            onClick={() => onSelectLevel('newcomer')}
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
            onClick={() => onSelectLevel('pro')}
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

      {/* Action Buttons */}
      <section className="pt-2 space-y-3">
        <button
          type="button"
          onClick={onStartMatch}
          className="w-full py-4 px-6 rounded-xl bg-[#C6FF3D] hover:bg-[#b5f526] active:scale-[0.99] text-[#0B1220] font-black text-lg tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(198,255,61,0.35)] cursor-pointer"
        >
          <svg className="w-5 h-5 fill-[#0B1220]" viewBox="0 0 24 24">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Kick off
        </button>

        <button
          type="button"
          onClick={onOpenLab}
          className="w-full py-3.5 px-4 rounded-xl bg-[#121B2F] hover:bg-[#182642] border border-slate-700/80 text-slate-200 font-bold text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <svg className="w-4 h-4 text-[#C6FF3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Analyst Lab
        </button>
      </section>
    </div>
  );
}
