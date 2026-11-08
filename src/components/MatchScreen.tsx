import { useState, useEffect, useRef } from 'react';
import type { Moment, Level } from '../data/match';

interface MatchScreenProps {
  moment: Moment;
  momentIndex: number;
  totalMoments: number;
  level: Level;
  onPick: (selectedIndex: number | null) => void;
}

const TOTAL_TIME = 15;

export function MatchScreen({
  moment,
  momentIndex,
  totalMoments,
  level,
  onPick,
}: MatchScreenProps) {
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [locked, setLocked] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // Use a ref to guarantee onPick is only called once per moment
  const resolvedRef = useRef(false);

  useEffect(() => {
    resolvedRef.current = false;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!resolvedRef.current) {
            resolvedRef.current = true;
            setLocked(true);
            setTimeout(() => {
              onPick(null);
            }, 300);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [moment.id, onPick]);

  const handleSelect = (index: number) => {
    if (locked || resolvedRef.current) return;
    resolvedRef.current = true;
    setLocked(true);
    setSelectedOption(index);
    setTimeout(() => {
      onPick(index);
    }, 350);
  };

  const progressPercent = Math.max(0, (timeLeft / TOTAL_TIME) * 100);
  const isUrgent = timeLeft <= 5;
  const isCritical = timeLeft <= 2;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-5 pt-1 pb-10">
      {/* Top Bar */}
      <header className="flex items-center justify-between bg-[#121B2F] border border-slate-800 rounded-2xl px-4 py-3 shadow-md">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-[#C6FF3D]/10 text-[#C6FF3D] border border-[#C6FF3D]/30 text-xs font-mono font-black uppercase">
            {momentIndex + 1} of {totalMoments}
          </span>
          <span className="text-xs font-bold text-slate-300">
            {moment.over}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase text-slate-400">Score:</span>
          <span className="text-xs font-mono font-bold text-white bg-[#0B1220] px-2.5 py-1 rounded-lg border border-slate-800">
            {moment.score}
          </span>
        </div>
      </header>

      {/* Countdown Timer Bar */}
      <section className="bg-[#121B2F] border border-slate-800/80 rounded-2xl p-3.5 space-y-2 shadow-md">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-slate-400">
            <svg
              className={`w-3.5 h-3.5 ${isCritical ? 'text-red-400 animate-spin' : isUrgent ? 'text-amber-400' : 'text-[#C6FF3D]'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Shot Clock
          </span>
          <span
            className={`font-mono text-sm px-2 py-0.5 rounded ${
              isCritical
                ? 'text-red-400 bg-red-950/60 border border-red-800 animate-pulse'
                : isUrgent
                ? 'text-amber-300 bg-amber-950/40 border border-amber-800/50'
                : 'text-[#C6FF3D] bg-[#0B1220] border border-slate-800'
            }`}
          >
            {timeLeft}s
          </span>
        </div>

        {/* Progress bar container */}
        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              isCritical
                ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]'
                : isUrgent
                ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                : 'bg-[#C6FF3D] shadow-[0_0_12px_rgba(198,255,61,0.6)]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </section>

      {/* Situation Card */}
      <section className="rounded-2xl bg-gradient-to-b from-[#16233B] to-[#10192A] p-4 border border-slate-700/60 shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Live Situation
          </span>
          <span className="text-[10px] font-mono uppercase font-bold text-[#C6FF3D] bg-[#C6FF3D]/10 px-2 py-0.5 rounded border border-[#C6FF3D]/20">
            {level} mode
          </span>
        </div>
        <p className="text-sm font-medium text-slate-100 leading-relaxed">
          {moment.situation[level]}
        </p>
      </section>

      {/* Question & Option Buttons */}
      <section className="space-y-3 pt-1">
        <div className="text-center px-1">
          <h2 className="text-xl font-black text-white tracking-tight">
            {moment.question}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tap your call before time expires
          </p>
        </div>

        <div className="space-y-2.5" role="group" aria-label="Prediction Options">
          {moment.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <button
                key={option}
                type="button"
                disabled={locked}
                onClick={() => handleSelect(idx)}
                className={`w-full min-h-[60px] p-4 rounded-xl font-bold text-base text-left flex items-center justify-between border-2 transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1D2F52] border-[#C6FF3D] text-[#C6FF3D] shadow-[0_0_20px_rgba(198,255,61,0.25)] scale-[1.01]'
                    : locked
                    ? 'bg-[#0E1626] border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                    : 'bg-[#121B2F] border-slate-800 hover:border-slate-600 hover:bg-[#18243E] text-slate-200 active:scale-[0.99]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-black uppercase ${
                      isSelected
                        ? 'bg-[#C6FF3D] text-[#0B1220]'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{option}</span>
                </div>

                {isSelected && (
                  <span className="text-xs font-bold font-mono uppercase bg-[#C6FF3D]/20 px-2 py-0.5 rounded text-[#C6FF3D]">
                    Selected
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
