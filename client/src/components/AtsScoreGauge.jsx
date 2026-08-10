import React from 'react';

export default function AtsScoreGauge({ score = 78, size = 'md' }) {
  const getScoreColor = (val) => {
    if (val >= 80) return 'text-emerald-400 stroke-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    if (val >= 65) return 'text-amber-400 stroke-amber-500 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 stroke-rose-500 bg-rose-500/10 border-rose-500/30';
  };

  const getScoreLabel = (val) => {
    if (val >= 80) return 'Excellent Match';
    if (val >= 65) return 'Moderate Match';
    return 'Needs Improvement';
  };

  const colorClass = getScoreColor(score);
  const strokeDash = `${score}, 100`;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-zinc-900 rounded-2xl border border-zinc-700 w-full max-w-[200px]">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="stroke-zinc-800"
            strokeWidth="3.5"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={`transition-all duration-1000 ease-out ${colorClass.split(' ')[1]}`}
            strokeDasharray={strokeDash}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-extrabold font-heading text-white">{score}</span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Score</span>
        </div>
      </div>
      <div className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
        {getScoreLabel(score)}
      </div>
    </div>
  );
}
