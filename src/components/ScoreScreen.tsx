import type { Level } from '../data/match';

interface ScoreScreenProps {
  userScore: number;
  analystScore: number;
  totalMoments: number;
  level: Level;
  onPlayAgain: () => void;
  onOpenLab: () => void;
}

export function ScoreScreen({
  userScore,
  analystScore,
  totalMoments,
  level,
  onPlayAgain,
  onOpenLab,
}: ScoreScreenProps) {
  const isWinner = userScore > analystScore;
  const isTie = userScore === analystScore;

  // One-line result message based on the match outcome
  let resultMessage = '';
  if (isWinner) {
    resultMessage = 'You out-predicted the Analyst and won the match!';
  } else if (isTie) {
    resultMessage = "It's a tie! Both you and the Analyst matched step for step.";
  } else {
    resultMessage = 'The Analyst won this round! Sharpen your calls and try again.';
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6 pt-2 pb-10">
      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#C6FF3D] flex items-center justify-center font-black text-[#0B1220]">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white uppercase italic leading-none">
              Call<span className="text-[#C6FF3D]">It</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C6FF3D]/80">
              Match Recap
            </span>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
          Mode: {level.toUpperCase()}
        </span>
      </header>

      {/* Outcome Banner */}
      <section className="text-center space-y-2 pt-2">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            isWinner
              ? 'bg-[#C6FF3D]/15 border border-[#C6FF3D]/40 text-[#C6FF3D]'
              : isTie
              ? 'bg-amber-400/15 border border-amber-400/40 text-amber-300'
              : 'bg-slate-800 border border-slate-700 text-slate-300'
          }`}
        >
          {isWinner ? 'Match Won' : isTie ? 'Drawn Match' : 'Analyst Victory'}
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white leading-tight">
          Final Whistle
        </h2>
        {/* One-line result message */}
        <p className="text-sm font-semibold text-slate-300 max-w-xs mx-auto">
          {resultMessage}
        </p>
      </section>

      {/* Large Scoreboard Card */}
      <section className="rounded-2xl bg-gradient-to-b from-[#16233B] to-[#0F192C] p-6 border-2 border-slate-700/80 shadow-2xl space-y-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Head-to-Head Score
          </span>
          {/* Large You vs Analyst scores */}
          <div className="mt-3 text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center justify-center gap-3">
            <span className="text-[#C6FF3D]">You {userScore}</span>
            <span className="text-slate-500 font-normal">:</span>
            <span className="text-sky-400">{analystScore} Analyst</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-1 block">
            Across {totalMoments} moments
          </span>
        </div>

        {/* Detailed Score Pillars */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* You Box */}
          <div
            className={`p-4 rounded-xl border flex flex-col items-center justify-center ${
              isWinner
                ? 'bg-[#152723] border-[#C6FF3D]/50 shadow-[0_0_15px_rgba(198,255,61,0.15)]'
                : 'bg-[#10192A] border-slate-800'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              You
            </span>
            <span className="text-4xl font-black text-[#C6FF3D] font-mono my-1">
              {userScore}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {Math.round((userScore / totalMoments) * 100)}% accuracy
            </span>
          </div>

          {/* Analyst Box */}
          <div
            className={`p-4 rounded-xl border flex flex-col items-center justify-center ${
              !isWinner && !isTie
                ? 'bg-[#13223A] border-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                : 'bg-[#10192A] border-slate-800'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Analyst
            </span>
            <span className="text-4xl font-black text-sky-400 font-mono my-1">
              {analystScore}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {Math.round((analystScore / totalMoments) * 100)}% accuracy
            </span>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="pt-2 space-y-3">
        <button
          type="button"
          onClick={onPlayAgain}
          className="w-full py-4 px-6 rounded-xl bg-[#C6FF3D] hover:bg-[#b5f526] active:scale-[0.99] text-[#0B1220] font-black text-lg tracking-wider uppercase transition-all duration-150 flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(198,255,61,0.35)] cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Play again
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
