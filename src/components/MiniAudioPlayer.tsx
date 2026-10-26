import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Music, 
  Clock, 
  X,
  CloudRain,
  Waves,
  Wind,
  Flame,
  Headphones,
  Radio,
  Coffee
} from 'lucide-react';
import { TRACK_LIST } from '../services/storage';
import { ambientEngine } from '../services/audioEngine';
import { AmbientTrack } from '../types';

export const MiniAudioPlayer: React.FC = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.65);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progressSec, setProgressSec] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  // Inactivity auto-fade
  const [isUserActive, setIsUserActive] = useState<boolean>(true);
  const inactivityTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleActivity = () => {
      setIsUserActive(true);
      if (inactivityTimeoutRef.current) {
        window.clearTimeout(inactivityTimeoutRef.current);
      }
      inactivityTimeoutRef.current = window.setTimeout(() => {
        setIsUserActive(false);
      }, 3500);
    };

    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('scroll', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });

    handleActivity();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
    };
  }, []);

  const currentTrack: AmbientTrack = TRACK_LIST[currentTrackIndex];

  // Progress bar simulation & sleep timer
  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setProgressSec(prev => {
          if (prev >= currentTrack.durationSec) {
            return 0;
          }
          return prev + 1;
        });

        if (sleepTimerRemaining !== null) {
          setSleepTimerRemaining(rem => {
            if (rem !== null && rem <= 1) {
              handleStop();
              return null;
            }
            return rem ? rem - 1 : null;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack.durationSec, sleepTimerRemaining]);

  const handlePlayTrack = (index: number) => {
    const track = TRACK_LIST[index];
    setCurrentTrackIndex(index);
    setProgressSec(0);
    ambientEngine.play(track.type);
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      ambientEngine.stop();
      setIsPlaying(false);
    } else {
      ambientEngine.play(currentTrack.type);
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    ambientEngine.stop();
    setIsPlaying(false);
    setSleepTimerRemaining(null);
  };

  const handleNext = () => {
    const nextIdx = (currentTrackIndex + 1) % TRACK_LIST.length;
    handlePlayTrack(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = (currentTrackIndex - 1 + TRACK_LIST.length) % TRACK_LIST.length;
    handlePlayTrack(prevIdx);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    ambientEngine.setVolume(newVol);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      ambientEngine.setVolume(volume > 0 ? volume : 0.65);
    } else {
      setIsMuted(true);
      ambientEngine.setVolume(0);
    }
  };

  const handleSetSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    if (minutes) {
      setSleepTimerRemaining(minutes * 60);
    } else {
      setSleepTimerRemaining(null);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getTrackIcon = (type: string) => {
    switch (type) {
      case 'rain': return CloudRain;
      case 'waves': return Waves;
      case 'forest': return Wind;
      case 'fire': return Flame;
      case 'lofi': return Headphones;
      case 'whitenoise': return Radio;
      case 'cafe': return Coffee;
      default: return Music;
    }
  };

  const CurrentIcon = getTrackIcon(currentTrack.type);

  // Hidden when user is inactive, unless modal is open
  const isButtonVisible = isModalOpen || isUserActive;

  return (
    <>
      {/* Small floating round button (Bottom Right, auto-fades on inactivity) */}
      <div 
        className={`fixed bottom-5 right-5 z-40 transition-all duration-300 ${
          isButtonVisible ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
        }`}
      >
        <button
          onClick={() => setIsModalOpen(true)}
          aria-label="Ortam Sesi Çalar"
          className="w-11 h-11 rounded-full glass glass-nav flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all text-[var(--txt)]"
          title="Odak Ambiyans Sesleri"
        >
          {isPlaying ? (
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 bg-indigo-400 animate-pulse h-2 rounded-full" />
              <span className="w-0.5 bg-indigo-400 animate-pulse h-3 rounded-full delay-75" />
              <span className="w-0.5 bg-indigo-400 animate-pulse h-1.5 rounded-full delay-150" />
            </div>
          ) : (
            <Music className="w-4 h-4 text-slate-300" />
          )}
        </button>
      </div>

      {/* Expanded Player Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn select-none">
          <div className="panel w-full max-w-sm p-6 rounded-3xl flex flex-col shadow-2xl relative">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-extrabold text-[var(--txt)]">Odak Ortam Sesleri</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--muted)] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Currently Playing Card */}
            <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] my-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-full glass flex items-center justify-center mx-auto text-indigo-400">
                <CurrentIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-[var(--txt)]">{currentTrack.title}</h4>
                <p className="text-[11px] text-[var(--muted)] font-light mt-0.5">{currentTrack.subtitle}</p>
              </div>

              {/* Progress & Time */}
              <div className="space-y-1">
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(progressSec / currentTrack.durationSec) * 100}%` }}
                    className="h-full bg-indigo-500 rounded-full transition-all"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[var(--muted)] font-mono">
                  <span>{formatTime(progressSec)}</span>
                  <span>{formatTime(currentTrack.durationSec)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 pt-1">
                <button onClick={handlePrev} className="text-[var(--muted)] hover:text-white p-1">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={handleTogglePlay}
                  className="w-10 h-10 rounded-full btn-accent flex items-center justify-center shadow-md"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
                <button onClick={handleNext} className="text-[var(--muted)] hover:text-white p-1">
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 pt-2 px-2">
                <button onClick={handleToggleMute} className="text-[var(--muted)] hover:text-white">
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                />
              </div>
            </div>

            {/* Track Playlist */}
            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              {TRACK_LIST.map((track, idx) => {
                const Icon = getTrackIcon(track.type);
                const isThis = idx === currentTrackIndex;

                return (
                  <button
                    key={track.id}
                    onClick={() => handlePlayTrack(idx)}
                    className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs transition-colors ${
                      isThis 
                        ? 'bg-[var(--accent-soft)] text-[var(--txt)] font-bold' 
                        : 'hover:bg-white/5 text-[var(--muted)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{track.title}</span>
                    </div>
                    {isThis && isPlaying && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sleep Timer */}
            <div className="pt-3 border-t border-[var(--border)] mt-3 flex items-center justify-between text-xs text-[var(--muted)]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Uyku:</span>
              </span>
              <div className="flex items-center gap-1 font-mono text-[11px]">
                {[15, 30, 45].map(mins => (
                  <button
                    key={mins}
                    onClick={() => handleSetSleepTimer(sleepTimerMinutes === mins ? null : mins)}
                    className={`px-2 py-0.5 rounded-md border ${
                      sleepTimerMinutes === mins
                        ? 'bg-indigo-500 text-white border-indigo-400'
                        : 'border-[var(--border)] hover:text-white'
                    }`}
                  >
                    {mins}d
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
