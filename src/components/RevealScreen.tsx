import type { Moment, Level } from '../data/match';

export type AnalystCall = {
  pick: number;
  why: string;
  source: 'live' | 'offline';
};

interface RevealScreenProps {
  moment: Moment;
  momentIndex: number;
  totalMoments: number;
  level: Level;
  userPick: number | null;
  analystCall: AnalystCall;
  onNext: () => void;
  onOpenChat: () => void;
}

export function RevealScreen({
  moment,
  momentIndex,
  totalMoments,
  level,
  userPick,
  analystCall,
  onNext,
  onOpenChat,
}: RevealScreenProps) {
  const isUserCorrect = userPick !== null && userPick === moment.correctIndex;
  const isAnalystCorrect = analystCall.pick === moment.correctIndex;
  const isLastMoment = momentIndex + 1 >= totalMoments;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-5 pt-1 pb-10">
      {/* Top Bar */}
      <header className="flex items-center justify-between bg-[#121B2F] border border-slate-800 rounded-2xl px-4 py-3 shadow-md">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-[#C6FF3D]/10 text-[#C6FF3D] border border-[#C6FF3D]/30 text-xs font-mono font-black uppercase">
            {momentIndex + 1} of {totalMoments}
          </span>
          <span className="text-xs font-bold text-slate-300">
            {moment.over} &bull; {moment.score}
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-[#C6FF3D] uppercase bg-[#C6FF3D]/10 px-2 py-0.5 rounded border border-[#C6FF3D]/20">
          Result Reveal
        </span>
      </header>

      {/* Outcome Banner */}
      <section className="rounded-2xl bg-gradient-to-b from-[#182642] to-[#10192A] p-5 border-2 border-[#C6FF3D]/40 shadow-xl text-center space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#C6FF3D]">
          Actual Play Outcome
        </span>
        <h2 className="text-2xl font-black text-white tracking-tight leading-snug">
          {moment.outcome}
        </h2>
      </section>

      {/* Who Scored Badges */}
      <section className="grid grid-cols-2 gap-3" aria-label="Points Awarded">
        {/* User Score Card */}
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between ${
            isUserCorrect
              ? 'bg-[#152723] border-[#C6FF3D]/60 shadow-[0_0_15px_rgba(198,255,61,0.15)]'
              : 'bg-[#121B2F] border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Your Pick
            </span>
            <span className="text-[11px] text-slate-400">
              {userPick === null ? 'Timed out' : isUserCorrect ? 'Correct!' : 'Missed'}
            </span>
          </div>
          <span
            className={`font-mono text-base font-black px-2.5 py-1 rounded-lg ${
              isUserCorrect
                ? 'bg-[#C6FF3D] text-[#0B1220]'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            {isUserCorrect ? 'You +1' : '+0'}
          </span>
        </div>

        {/* Analyst Score Card */}
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between ${
            isAnalystCorrect
              ? 'bg-[#13223A] border-sky-400/60 shadow-[0_0_15px_rgba(56,189,248,0.15)]'
              : 'bg-[#121B2F] border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Analyst
            </span>
            <span className="text-[11px] text-slate-400">
              {isAnalystCorrect ? 'Hit target' : 'Missed'}
            </span>
          </div>
          <span
            className={`font-mono text-base font-black px-2.5 py-1 rounded-lg ${
              isAnalystCorrect
                ? 'bg-sky-400 text-[#0B1220]'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            {isAnalystCorrect ? 'Analyst +1' : '+0'}
          </span>
        </div>
      </section>

      {/* Options Breakdown (Highlight Correct & User Pick) */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Options Breakdown
        </h3>
        <div className="space-y-2">
          {moment.options.map((option, idx) => {
            const isCorrect = idx === moment.correctIndex;
            const isUserSelection = userPick === idx;

            return (
              <div
                key={option}
                className={`p-3.5 rounded-xl border-2 flex items-center justify-between transition-all ${
                  isCorrect
                    ? 'bg-[#142634] border-[#C6FF3D] text-white shadow-[0_0_15px_rgba(198,255,61,0.2)]'
                    : isUserSelection
                    ? 'bg-rose-950/30 border-rose-500/80 text-rose-200'
                    : 'bg-[#0E1626] border-slate-800 text-slate-400 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-black ${
                      isCorrect
                        ? 'bg-[#C6FF3D] text-[#0B1220]'
                        : isUserSelection
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="font-bold text-sm leading-tight">{option}</span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
                  {isCorrect && (
                    <span className="px-2 py-0.5 rounded bg-[#C6FF3D] text-[#0B1220] uppercase font-black">
                      Correct
                    </span>
                  )}
                  {isUserSelection && (
                    <span
                      className={`px-2 py-0.5 rounded uppercase ${
                        isCorrect
                          ? 'bg-emerald-900/80 text-[#C6FF3D] border border-[#C6FF3D]/40'
                          : 'bg-rose-900/80 text-rose-200 border border-rose-700/60'
                      }`}
                    >
                      Your Pick
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Analyst's Call */}
      <section className="rounded-2xl bg-[#121B2F] border border-slate-700/80 p-4 space-y-2 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-200">
              Analyst's Call
            </span>
            {analystCall.source === 'live' ? (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C6FF3D] bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF3D] animate-pulse" />
                Live AI
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                Offline mode
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
            Pick: "{moment.options[analystCall.pick]}"
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed pt-1">
          {analystCall.why}
        </p>

        {/* Small "Ask the Analyst" button to jump to Lab Chat */}
        <div className="pt-2 border-t border-slate-800/80 flex justify-end">
          <button
            type="button"
            onClick={onOpenChat}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C6FF3D] hover:text-[#b5f526] bg-[#C6FF3D]/10 hover:bg-[#C6FF3D]/20 border border-[#C6FF3D]/30 px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Ask the Analyst
          </button>
        </div>
      </section>

      {/* Why it happened (Explanation) */}
      <section className="rounded-2xl bg-[#0E1626] border border-slate-800 p-4 space-y-2 shadow-md">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-[#C6FF3D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Why it happened
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          {moment.explanation[level]}
        </p>
      </section>

      {/* Next Button */}
      <section className="pt-2">
        <button
          type="button"
          onClick={onNext}
          className="w-full py-4 px-6 rounded-xl bg-[#C6FF3D] hover:bg-[#b5f526] active:scale-[0.99] text-[#0B1220] font-black text-lg tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(198,255,61,0.35)] cursor-pointer"
        >
          <span>{isLastMoment ? 'See final score' : 'Next'}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>
    </div>
  );
}
