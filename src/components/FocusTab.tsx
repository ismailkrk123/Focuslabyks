import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  Coffee, 
  Flame, 
  TreePine
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FocusTabProps {
  onSessionComplete: (durationMinutes: number) => void;
  treePoints: number;
}

type FocusMode = 'pomodoro25' | 'pomodoro50' | 'stopwatch';

export const FocusTab: React.FC<FocusTabProps> = ({ onSessionComplete, treePoints }) => {
  const [mode, setMode] = useState<FocusMode>('pomodoro25');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [totalSessions, setTotalSessions] = useState<number>(3);

  // Set initial time when mode changes
  useEffect(() => {
    if (mode === 'pomodoro25') {
      setSecondsLeft(isBreak ? 5 * 60 : 25 * 60);
    } else if (mode === 'pomodoro50') {
      setSecondsLeft(isBreak ? 10 * 60 : 50 * 60);
    }
    setIsActive(false);
  }, [mode, isBreak]);

  // Main countdown / countup timer loop
  useEffect(() => {
    let interval: number;

    if (isActive) {
      interval = window.setInterval(() => {
        if (mode === 'stopwatch') {
          setStopwatchSeconds(prev => prev + 1);
        } else {
          setSecondsLeft(prev => {
            if (prev <= 1) {
              handleTimerFinish();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, mode, isBreak]);

  const handleTimerFinish = () => {
    setIsActive(false);
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch {}

    if (!isBreak) {
      const minutesCompleted = mode === 'pomodoro25' ? 25 : 50;
      onSessionComplete(minutesCompleted);
      setTotalSessions(s => s + 1);
      setIsBreak(true);
    } else {
      setIsBreak(false);
    }
  };

  const handleToggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleResetTimer = () => {
    setIsActive(false);
    if (mode === 'stopwatch') {
      setStopwatchSeconds(0);
    } else if (mode === 'pomodoro25') {
      setSecondsLeft(isBreak ? 5 * 60 : 25 * 60);
    } else if (mode === 'pomodoro50') {
      setSecondsLeft(isBreak ? 10 * 60 : 50 * 60);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getTotalTimeForCurrentMode = () => {
    if (mode === 'pomodoro25') return isBreak ? 5 * 60 : 25 * 60;
    if (mode === 'pomodoro50') return isBreak ? 10 * 60 : 50 * 60;
    return 3600;
  };

  const totalTime = getTotalTimeForCurrentMode();
  const progressRatio = mode === 'stopwatch' 
    ? (stopwatchSeconds % 3600) / 3600 
    : 1 - (secondsLeft / totalTime);

  return (
    <div className="max-w-2xl mx-auto space-y-6 select-none px-2 sm:px-4">
      {/* Mode Switcher Capsule */}
      <div className="flex items-center justify-center gap-1.5 p-1 rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] max-w-sm mx-auto">
        <button
          onClick={() => { setMode('pomodoro25'); setIsBreak(false); }}
          className={`py-1.5 px-3.5 rounded-full text-xs transition-all ${
            mode === 'pomodoro25'
              ? 'bg-white/10 text-[var(--txt)] font-extrabold shadow-sm'
              : 'text-[var(--muted)] hover:text-[var(--txt)]'
          }`}
        >
          25/5 Pomodoro
        </button>
        <button
          onClick={() => { setMode('pomodoro50'); setIsBreak(false); }}
          className={`py-1.5 px-3.5 rounded-full text-xs transition-all ${
            mode === 'pomodoro50'
              ? 'bg-white/10 text-[var(--txt)] font-extrabold shadow-sm'
              : 'text-[var(--muted)] hover:text-[var(--txt)]'
          }`}
        >
          50/10 Derin Odak
        </button>
        <button
          onClick={() => { setMode('stopwatch'); }}
          className={`py-1.5 px-3.5 rounded-full text-xs transition-all ${
            mode === 'stopwatch'
              ? 'bg-white/10 text-[var(--txt)] font-extrabold shadow-sm'
              : 'text-[var(--muted)] hover:text-[var(--txt)]'
          }`}
        >
          Kronometre
        </button>
      </div>

      {/* Main Solid Panel Timer Card */}
      <div className="panel p-8 sm:p-12 text-center relative overflow-hidden flex flex-col items-center shadow-xl">
        {/* State Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] mb-6 text-xs font-medium">
          {mode === 'stopwatch' ? (
            <Timer className="w-3.5 h-3.5 text-indigo-400" />
          ) : isBreak ? (
            <Coffee className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <Flame className="w-3.5 h-3.5 text-indigo-400" />
          )}
          <span className="text-[var(--muted)]">
            {mode === 'stopwatch' 
              ? 'Serbest çalışma süresi' 
              : isBreak 
                ? 'Dinlenme molası' 
                : 'Yüksek odak modu'}
          </span>
        </div>

        {/* Circular Ring & Time Display */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-3">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-[var(--border)] fill-none"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="fill-none stroke-indigo-500 transition-all duration-300"
              strokeWidth="4"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - progressRatio)}
              strokeLinecap="round"
            />
          </svg>

          {/* Time Digits */}
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span className="text-5xl sm:text-6xl font-extrabold text-[var(--txt)] font-mono tracking-tight">
              {mode === 'stopwatch' ? formatTimer(stopwatchSeconds) : formatTimer(secondsLeft)}
            </span>
            <span className="text-xs text-[var(--muted)] font-light mt-1">
              {isActive ? 'Zaman akıyor...' : 'Hazır'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handleResetTimer}
            className="w-12 h-12 rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--txt)] transition-colors"
            title="Sıfırla"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleTimer}
            className="btn-accent py-3.5 px-9 font-extrabold text-sm flex items-center gap-2.5 shadow-lg"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Duraklat</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Odaklanmayı Başlat</span>
              </>
            )}
          </button>
        </div>

        {/* Footer Stats inside Focus Card */}
        <div className="mt-8 pt-6 border-t border-[var(--border)] w-full max-w-sm flex items-center justify-around text-xs">
          <div>
            <p className="text-[var(--muted)]">Tamamlanan Seans</p>
            <p className="text-sm font-extrabold text-[var(--txt)] font-mono mt-0.5">{totalSessions} Seans</p>
          </div>
          <div className="h-6 w-px bg-[var(--border)]" />
          <div>
            <p className="text-[var(--muted)]">Bahçe Puanı</p>
            <p className="text-sm font-extrabold text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
              <TreePine className="w-3.5 h-3.5" />
              <span>+{treePoints} Puan</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
