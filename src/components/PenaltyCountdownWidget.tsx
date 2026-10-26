import React, { useState } from 'react';
import { Hourglass, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';

interface PenaltyCountdownWidgetProps {
  secondsLeft: number;
  totalDuration: number;
  failureCount: number;
  consecutiveSuccessStreak: number;
}

export const PenaltyCountdownWidget: React.FC<PenaltyCountdownWidgetProps> = ({
  secondsLeft,
  totalDuration,
  failureCount,
  consecutiveSuccessStreak
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (secondsLeft <= 0) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progress: 0 at start, 1 when finished (outer ring completes as time decreases)
  const safeTotal = totalDuration > 0 ? totalDuration : 60;
  const progress = Math.max(0, Math.min(1, (safeTotal - secondsLeft) / safeTotal));

  // Circular SVG dimensions
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-50 animate-fadeIn select-none pointer-events-auto">
      <div className="glass rounded-[28px] p-2.5 sm:p-3 border-rose-500/35 shadow-[0_10px_35px_rgba(244,63,94,0.18)] backdrop-blur-xl flex items-center gap-3">
        {/* Circular Progress Ring */}
        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
          <svg className="w-14 h-14 -rotate-90 transform overflow-visible" viewBox="0 0 64 64">
            {/* Background Track Circle */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="3.5"
              fill="transparent"
            />
            {/* Progress Completing Circle */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="url(#penalty-ring-grad)"
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="penalty-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#be123c" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time text centered inside circular ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-mono text-[11px] font-black text-rose-200 tracking-tight leading-none">
              {timeFormatted}
            </span>
            <span className="text-[8px] text-[var(--muted)] font-mono uppercase mt-0.5">kaldı</span>
          </div>
        </div>

        {/* Informative text & controls */}
        {isExpanded ? (
          <div className="pr-1 text-left max-w-[190px]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
              <Hourglass className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Ceza Süresi</span>
            </div>
            <p className="text-[10px] text-[var(--muted)] font-light leading-tight mt-0.5">
              Kütüphane ve görevler geçici kilitlidir.
            </p>
            <div className="mt-1 flex items-center justify-between text-[9px] text-rose-300/80 font-mono">
              <span style={{ color: '#e73a55' }}>Seviye: {failureCount}x</span>
              <span>Seri: {consecutiveSuccessStreak}/5</span>
            </div>
          </div>
        ) : null}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[var(--muted)] hover:text-white p-1 rounded-full transition-colors"
          title={isExpanded ? 'Küçült' : 'Genişlet'}
        >
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
