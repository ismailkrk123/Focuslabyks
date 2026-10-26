import React, { useState, useEffect, useRef } from 'react';
import { 
  LogOut, 
  Settings2, 
  Image as ImageIcon, 
  Users, 
  TreePine, 
  Play, 
  Pause, 
  Clock, 
  Upload, 
  X, 
  ChevronDown,
  ChevronUp,
  Sparkles,
  Droplets,
  ShieldAlert,
  AlertTriangle,
  MoreVertical
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  LibrarySettings, 
  UserProfile, 
  StudyFriend 
} from '../types';
import { NATURE_BACKGROUNDS } from '../services/storage';

interface VirtualLibraryProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  librarySettings: LibrarySettings;
  setLibrarySettings: React.Dispatch<React.SetStateAction<LibrarySettings>>;
  onExitLibrary: () => void;
  onSessionComplete: (mins: number) => void;
  onPenaltyTriggered: (durationSec: number) => void;
  onCorrectAttentionCheck: () => void;
  failureCount: number;
}

export const VirtualLibrary: React.FC<VirtualLibraryProps> = ({
  userProfile,
  setUserProfile,
  librarySettings,
  setLibrarySettings,
  onExitLibrary,
  onSessionComplete,
  onPenaltyTriggered,
  onCorrectAttentionCheck,
  failureCount
}) => {
  // Study states
  const [isFocusing, setIsFocusing] = useState<boolean>(true);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [pomodoroLeft, setPomodoroLeft] = useState<number>(25 * 60);

  // Modals & Panels (ONLY Tree & Garden, NO store/cart)
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showTreeModal, setShowTreeModal] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showBgPicker, setShowBgPicker] = useState<boolean>(false);
  const [showQuickMenu, setShowQuickMenu] = useState<boolean>(false);

  // Attention Check (Dikkat Kontrolü) States
  const [attentionActive, setAttentionActive] = useState<boolean>(false);
  const [attentionTarget, setAttentionTarget] = useState<number>(74);
  const [attentionOptions, setAttentionOptions] = useState<number[]>([74, 47, 84, 72]);
  const [attentionTimeLeft, setAttentionTimeLeft] = useState<number>(5);
  const [showAttentionWarning, setShowAttentionWarning] = useState<boolean>(false);
  const [calculatedPenaltySec, setCalculatedPenaltySec] = useState<number>(60);
  const [attentionSuccessFeedback, setAttentionSuccessFeedback] = useState<string | null>(null);

  // Tree growth day selector (0 to 3)
  const [treeHistoryDay, setTreeHistoryDay] = useState<number>(3);
  const [waterEffect, setWaterEffect] = useState<boolean>(false);

  // Room code input
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  // OLED Deep Focus Inactivity Dimming (Hides peripheral UI after idle time, tap/click to wake)
  const [isDimmed, setIsDimmed] = useState<boolean>(false);
  const dimTimerRef = useRef<number | null>(null);

  const resetDimTimer = () => {
    setIsDimmed(false);
    if (dimTimerRef.current) {
      window.clearTimeout(dimTimerRef.current);
    }
    // Only schedule dimming if no interactive modal, menu, or attention check is currently active
    if (
      !attentionActive && 
      !showTreeModal && 
      !showExitConfirm && 
      !showSettingsModal && 
      !showInviteModal && 
      !showBgPicker &&
      !showQuickMenu
    ) {
      dimTimerRef.current = window.setTimeout(() => {
        setIsDimmed(true);
      }, 6000); // 6 seconds of idle time triggers deep focus calm
    }
  };

  useEffect(() => {
    resetDimTimer();

    const handleUserActivity = () => {
      resetDimTimer();
    };

    window.addEventListener('pointerdown', handleUserActivity);
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    return () => {
      if (dimTimerRef.current) clearTimeout(dimTimerRef.current);
      window.removeEventListener('pointerdown', handleUserActivity);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
    };
  }, [
    attentionActive,
    showTreeModal,
    showExitConfirm,
    showSettingsModal,
    showInviteModal,
    showBgPicker,
    showQuickMenu
  ]);

  // Helper to calculate escalation penalty duration
  const calculatePenaltyDuration = (currentFailures: number) => {
    const nextFailure = currentFailures + 1;
    // 1st: 60s (1m), 2nd: 180s (3m), 3rd: 300s (5m) ... max 1800s (30m)
    return Math.min(1800, 60 + (nextFailure - 1) * 120);
  };

  // Trigger attention check function
  const triggerAttentionCheck = () => {
    const target = Math.floor(Math.random() * 80) + 15; // 15 to 94
    const distractors: number[] = [];
    while (distractors.length < 3) {
      const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 8) + 1);
      const val = target + offset;
      if (val !== target && val > 10 && !distractors.includes(val)) {
        distractors.push(val);
      }
    }
    const shuffled = [target, ...distractors].sort(() => Math.random() - 0.5);
    setAttentionTarget(target);
    setAttentionOptions(shuffled);
    setAttentionTimeLeft(5);
    setAttentionActive(true);
  };

  const handleAttentionFailure = () => {
    setAttentionActive(false);
    setIsFocusing(false);
    // Heavy deduction (-80 points or up to 0)
    setUserProfile(prev => ({
      ...prev,
      treePoints: Math.max(0, prev.treePoints - 80)
    }));
    const duration = calculatePenaltyDuration(failureCount);
    setCalculatedPenaltySec(duration);
    onPenaltyTriggered(duration);
    setShowAttentionWarning(true);
  };

  const handleSelectAttentionOption = (selected: number) => {
    if (selected === attentionTarget) {
      // Success: +10 points
      setAttentionActive(false);
      setUserProfile(prev => ({
        ...prev,
        treePoints: prev.treePoints + 10
      }));
      setAttentionSuccessFeedback('+10 Odak Puanı Kazandınız! Dikkatiniz tam.');
      onCorrectAttentionCheck();
      try {
        confetti({ particleCount: 25, spread: 40 });
      } catch {}
      setTimeout(() => setAttentionSuccessFeedback(null), 3000);
    } else {
      handleAttentionFailure();
    }
  };

  // 1. Guaranteed Immediate Attention Check upon entering the library (within 2 seconds)
  const initialCheckDoneRef = useRef<boolean>(false);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      if (!initialCheckDoneRef.current) {
        initialCheckDoneRef.current = true;
        triggerAttentionCheck();
      }
    }, 2000);

    return () => clearTimeout(initialTimer);
  }, []);

  // 2. Subsequent spontaneous random attention checks during focused study
  useEffect(() => {
    if (!isFocusing) return;
    const randomDelay = Math.floor(Math.random() * 90 + 75) * 1000;
    const timer = setTimeout(() => {
      if (initialCheckDoneRef.current && !attentionActive) {
        triggerAttentionCheck();
      }
    }, randomDelay);
    return () => clearTimeout(timer);
  }, [isFocusing, sessionSeconds, attentionActive]);

  // Strict 5-second countdown ticker for attention check
  useEffect(() => {
    let interval: number;
    if (attentionActive) {
      interval = window.setInterval(() => {
        setAttentionTimeLeft(prev => {
          if (prev <= 1) {
            handleAttentionFailure();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [attentionActive]);

  // Tree Canvas Ref
  const treeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Wall clock ticker
  const [currentWallTime, setCurrentWallTime] = useState<{ hours: string; minutes: string }>({
    hours: '12',
    minutes: '00'
  });

  useEffect(() => {
    const updateWallClock = () => {
      const now = new Date();
      setCurrentWallTime({
        hours: String(now.getHours()).padStart(2, '0'),
        minutes: String(now.getMinutes()).padStart(2, '0')
      });
    };
    updateWallClock();
    const interval = setInterval(updateWallClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Session timer ticker
  useEffect(() => {
    let interval: number;
    if (isFocusing) {
      interval = window.setInterval(() => {
        setSessionSeconds(s => s + 1);
        setPomodoroLeft(p => {
          if (p <= 1) {
            setIsFocusing(false);
            onSessionComplete(25);
            setUserProfile(prev => ({ ...prev, treePoints: prev.treePoints + 25 }));
            try {
              confetti({ particleCount: 50, spread: 60 });
            } catch {}
            return 5 * 60;
          }
          return p - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFocusing, onSessionComplete, setUserProfile]);

  // Procedural Tree Drawing Effect
  useEffect(() => {
    if (!showTreeModal || !treeCanvasRef.current) return;
    const canvas = treeCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const depths = [5, 7, 8, 10];
    const targetDepth = depths[treeHistoryDay] || 9;
    const startX = canvas.width / 2;
    const startY = canvas.height - 30;
    const initialLen = 58 + treeHistoryDay * 8;

    const drawBranch = (x: number, y: number, len: number, angle: number, depth: number) => {
      if (depth === 0) {
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = treeHistoryDay >= 3 ? '#6366f1' : 'rgba(99,102,241,0.5)';
        ctx.fill();
        return;
      }

      ctx.beginPath();
      ctx.moveTo(x, y);
      const xEnd = x + len * Math.sin(angle);
      const yEnd = y - len * Math.cos(angle);
      ctx.lineTo(xEnd, yEnd);

      ctx.lineWidth = Math.max(1.2, depth * 1.15);
      ctx.strokeStyle = depth > 3 ? '#94a3b8' : '#818cf8';
      ctx.lineCap = 'round';
      ctx.stroke();

      const spread = 0.36 + (depth * 0.015);
      drawBranch(xEnd, yEnd, len * 0.76, angle - spread, depth - 1);
      drawBranch(xEnd, yEnd, len * 0.76, angle + spread, depth - 1);
      if (depth > 4) {
        drawBranch(xEnd, yEnd, len * 0.55, angle + (Math.random() - 0.5) * 0.15, depth - 2);
      }
    };

    drawBranch(startX, startY, initialLen, 0, targetDepth);
  }, [showTreeModal, treeHistoryDay, waterEffect]);

  const formatSessionTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}s ${m}d`;
    return `${m}d ${s}sn`;
  };

  const formatClockDigits = (val: number) => {
    const m = Math.floor(val / 60);
    const s = val % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const activeBgObj = NATURE_BACKGROUNDS.find(b => b.id === librarySettings.backgroundPreset);
  const backgroundImageUrl = librarySettings.customBackgroundUrl || activeBgObj?.url || NATURE_BACKGROUNDS[0].url;

  const handleWaterTree = () => {
    setWaterEffect(true);
    setUserProfile(p => ({ ...p, treePoints: p.treePoints + 15 }));
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch {}
    setTimeout(() => setWaterEffect(false), 1000);
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(userProfile.roomCode);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleJoinFriendRoom = () => {
    if (!joinCodeInput.trim()) return;
    const newFriend: StudyFriend = {
      id: 'friend-' + Date.now(),
      name: `Misafir (${joinCodeInput.toUpperCase()})`,
      status: 'focus',
      points: 750,
      avatarColor: '#6366f1',
      deskStyle: Math.floor(Math.random() * 3) + 1
    };
    setUserProfile(prev => ({
      ...prev,
      friends: [...prev.friends, newFriend]
    }));
    setJoinCodeInput('');
    setShowInviteModal(false);
  };

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLibrarySettings(prev => ({
            ...prev,
            customBackgroundUrl: event.target!.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      onClick={() => {
        setShowQuickMenu(false);
        resetDimTimer();
      }}
      className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-between select-none"
      style={{
        backgroundImage: `linear-gradient(rgba(12, 14, 20, 0.72), rgba(12, 14, 20, 0.88)), url("${backgroundImageUrl}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Top Header Bar inside Virtual Library (DIMS OUT ON IDLE, tap to wake) */}
      <div className={`w-full p-4 sm:p-5 flex items-center justify-between gap-2 z-20 transition-all duration-700 ease-out ${
        isDimmed ? 'opacity-0 pointer-events-none -translate-y-3' : 'opacity-100 translate-y-0'
      }`}>
        {/* Left: Total session time capsule */}
        <div className="glass px-4 py-2 rounded-full flex items-center gap-2 text-xs shadow-md">
          <Clock className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-[var(--muted)]">Etüt:</span>
          <span className="font-mono font-medium text-[var(--txt)]">
            {formatSessionTime(sessionSeconds)}
          </span>
        </div>

        {/* Right: Single Circular 3-Dots Glass Button & Dropdown Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              resetDimTimer();
              setShowQuickMenu(prev => !prev);
            }}
            className="w-10 h-10 rounded-full glass flex items-center justify-center hover:border-white/40 active:scale-95 transition-all shadow-md cursor-pointer"
            title="Kütüphane Menüsü"
          >
            <MoreVertical className="w-4 h-4 text-white" />
          </button>

          {/* Quick Menu Popover Panel */}
          {showQuickMenu && (
            <>
              {/* Invisible click-outside backdrop to close quick menu on outside click */}
              <div 
                className="fixed inset-0 z-20 cursor-default" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuickMenu(false);
                }} 
              />
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-12 w-48 p-2 rounded-2xl liquid-glass-modal shadow-2xl border border-white/20 z-30 flex flex-col gap-1 origin-top-right transform transition-all duration-200 animate-fadeIn"
              >
              {/* 1. Ağaç */}
              <button
                onClick={() => { setShowQuickMenu(false); setShowTreeModal(true); }}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-white hover:bg-white/10 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <TreePine className="w-4 h-4 text-emerald-400" />
                  <span>Ağaç</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  +{userProfile.treePoints}
                </span>
              </button>

              {/* 2. Arka Plan (Görsel) */}
              <button
                onClick={() => { setShowQuickMenu(false); setShowBgPicker(true); }}
                className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <span>Arka Plan</span>
              </button>

              {/* 3. Odaya Katıl */}
              <button
                onClick={() => { setShowQuickMenu(false); setShowInviteModal(true); }}
                className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4 text-sky-400" />
                <span>Odaya Katıl</span>
              </button>

              {/* 4. Ayarlar */}
              <button
                onClick={() => { setShowQuickMenu(false); setShowSettingsModal(true); }}
                className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Settings2 className="w-4 h-4 text-slate-300" />
                <span>Ayarlar</span>
              </button>

              <div className="my-1 border-t border-white/10" />

              {/* 5. Çıkış */}
              <button
                onClick={() => { setShowQuickMenu(false); setShowExitConfirm(true); }}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/15 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Çıkış</span>
              </button>
            </div>
          </>
        )}
        </div>
      </div>

      {/* Screen Center: Clean Large Clock & Name & Focus State (ALWAYS VISIBLE) */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        {attentionSuccessFeedback && (
          <div className="mb-4 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold animate-fadeIn shadow-lg">
            {attentionSuccessFeedback}
          </div>
        )}

        {/* 1. Saat (Clock - ALWAYS VISIBLE) */}
        {librarySettings.showClock && (
          <div 
            onClick={() => {
              setLibrarySettings(s => ({
                ...s,
                clockType: s.clockType === 'digital' ? 'analog' : 'digital'
              }));
            }}
            className="cursor-pointer group flex flex-col items-center select-none"
            title="Saate tıklayarak Dijital/Analog görünümü arasında geçiş yapabilirsiniz"
          >
            {librarySettings.clockType === 'digital' ? (
              <span className="text-7xl sm:text-9xl liquid-glass-clock-digits hover:scale-[1.02] transition-transform select-none">
                {currentWallTime.hours}:{currentWallTime.minutes}
              </span>
            ) : (
              <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full border border-white/20 glass relative flex items-center justify-center group-hover:scale-105 transition-transform">
                <div className="w-2.5 h-2.5 rounded-full bg-white z-20" />
                <div 
                  className="absolute w-1 bg-white/90 rounded-full origin-bottom z-10"
                  style={{
                    height: '28%',
                    bottom: '50%',
                    transform: `rotate(${(Number(currentWallTime.hours) % 12) * 30 + (Number(currentWallTime.minutes) / 2)}deg)`
                  }}
                />
                <div 
                  className="absolute w-0.5 bg-indigo-400 rounded-full origin-bottom z-10"
                  style={{
                    height: '42%',
                    bottom: '50%',
                    transform: `rotate(${Number(currentWallTime.minutes) * 6}deg)`
                  }}
                />
                <span className="absolute top-2 text-[10px] font-mono text-[var(--muted)]">12</span>
                <span className="absolute right-3 text-[10px] font-mono text-[var(--muted)]">3</span>
                <span className="absolute bottom-2 text-[10px] font-mono text-[var(--muted)]">6</span>
                <span className="absolute left-3 text-[10px] font-mono text-[var(--muted)]">9</span>
              </div>
            )}
          </div>
        )}

        {/* 2. İsim (User Name ONLY - Target Goal removed as requested) */}
        <div className="mt-4 flex items-center justify-center">
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--txt)] drop-shadow-sm">
            {userProfile.name}
          </span>
        </div>

        {/* 3. Odakta Paneli (ALWAYS VISIBLE - Focus toggle & Pomodoro left) */}
        <div className="mt-3.5 flex items-center gap-3">
          <button
            onClick={() => setIsFocusing(!isFocusing)}
            className="glass px-5 py-2 rounded-full flex items-center gap-2.5 text-xs font-medium text-[var(--txt)] hover:border-white/30 transition-all shadow-sm cursor-pointer"
          >
            <span 
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                isFocusing 
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' 
                  : 'bg-slate-500'
              }`} 
            />
            <span>{isFocusing ? 'Odakta' : 'Mola'}</span>
            <span className="ml-1 text-[var(--muted)]">
              {isFocusing ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
            </span>
          </button>

          {librarySettings.showPomodoro && (
            <div className="glass px-4 py-2 rounded-full font-mono text-xs text-[var(--muted)]">
              <span>Kalan: </span>
              <span className="font-bold text-[var(--txt)]">{formatClockDigits(pomodoroLeft)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Subtle Sleep Hint when Dimmed */}
      <div 
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-opacity duration-1000 ${
          isDimmed ? 'opacity-40' : 'opacity-0'
        }`}
      >
        <span className="text-[10px] text-white/60 tracking-widest font-light uppercase">
          Ekrana dokunarak uyandırın
        </span>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Growing Tree & Focus Forest Modal (ONLY Tree & Points as requested) */}
      {showTreeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="panel w-full max-w-lg p-6 rounded-3xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-emerald-400">
                  <TreePine className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--txt)]">Büyüyen Odak Ağacı</h3>
                  <p className="text-xs text-[var(--muted)] font-light">Seanslar tamamlandıkça ağacınız filizlenir ve puan kazandırır.</p>
                </div>
              </div>
              <button onClick={() => setShowTreeModal(false)} className="text-[var(--muted)] hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-full max-w-md h-56 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center overflow-hidden">
                <canvas ref={treeCanvasRef} width={420} height={220} className="w-full h-full object-contain" />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/40 text-emerald-300 text-[11px] font-mono border border-emerald-500/20">
                  Bahçe Puanı: {userProfile.treePoints}
                </div>
              </div>

              {/* Day-by-Day Evolution Slider */}
              <div className="w-full max-w-md mt-4">
                <div className="flex justify-between text-xs text-[var(--muted)] font-medium mb-1.5">
                  <span>Gelişim Aşamaları (Geçmiş Günler)</span>
                  <span className="text-[var(--txt)] font-bold">
                    {treeHistoryDay === 3 ? 'Bugün (Lush)' : `${3 - treeHistoryDay} Gün Önce`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  value={treeHistoryDay}
                  onChange={(e) => setTreeHistoryDay(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-[var(--muted)] mt-1 font-mono">
                  <span>Tohum</span>
                  <span>Fidan</span>
                  <span>Genç Ağaç</span>
                  <span className="text-emerald-400 font-bold">Ulu Ağaç (Bugün)</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
              <button
                onClick={handleWaterTree}
                className="btn-accent px-4 py-2 rounded-full font-bold flex items-center gap-1.5 shadow-md"
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Ağacı Sula (+15 Puan)</span>
              </button>

              <button
                onClick={() => setShowTreeModal(false)}
                className="px-5 py-2 rounded-full border border-[var(--border)] text-[var(--muted)] hover:text-white"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Background Picker Modal */}
      {showBgPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="panel w-full max-w-xl p-6 rounded-3xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-sm font-extrabold text-[var(--txt)] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-300" />
                <span>Manzara & Arka Plan</span>
              </h3>
              <button onClick={() => setShowBgPicker(false)} className="text-[var(--muted)] hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {NATURE_BACKGROUNDS.map(bg => (
                  <div
                    key={bg.id}
                    onClick={() => {
                      setLibrarySettings(s => ({ ...s, backgroundPreset: bg.id, customBackgroundUrl: '' }));
                    }}
                    className={`relative rounded-xl overflow-hidden h-24 border cursor-pointer group ${
                      librarySettings.backgroundPreset === bg.id && !librarySettings.customBackgroundUrl
                        ? 'border-indigo-400 ring-2 ring-indigo-400/30'
                        : 'border-[var(--border)] hover:border-[var(--border-hover)]'
                    }`}
                  >
                    <img src={bg.thumbnail} alt={bg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2">
                      <span className="text-[11px] font-medium text-white truncate">{bg.title}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-full border border-dashed border-[var(--border)] hover:border-[var(--border-hover)] cursor-pointer text-xs text-[var(--muted)] hover:text-white transition-colors">
                  <Upload className="w-3.5 h-3.5 text-slate-300" />
                  <span>Kendi Fotoğrafınızı Yükleyin (JPG/PNG)</span>
                  <input type="file" accept="image/*" onChange={handleCustomBgUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex justify-end">
              <button
                onClick={() => setShowBgPicker(false)}
                className="btn-accent px-6 py-2 text-xs font-bold"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="panel w-full max-w-md p-6 rounded-3xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-sm font-extrabold text-[var(--txt)]">Kütüphane Görünüm Ayarları</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-[var(--muted)] hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--txt)]">Saat Göstergesi</p>
                  <p className="text-[11px] text-[var(--muted)] font-light">Ana ekranda saati aç/kapat</p>
                </div>
                <input
                  type="checkbox"
                  checked={librarySettings.showClock}
                  onChange={(e) => setLibrarySettings(s => ({ ...s, showClock: e.target.checked }))}
                  className="w-4 h-4 accent-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--txt)]">Pomodoro Sayacı</p>
                  <p className="text-[11px] text-[var(--muted)] font-light">Kalan odak süresini göster</p>
                </div>
                <input
                  type="checkbox"
                  checked={librarySettings.showPomodoro}
                  onChange={(e) => setLibrarySettings(s => ({ ...s, showPomodoro: e.target.checked }))}
                  className="w-4 h-4 accent-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--txt)]">Saat Modeli</p>
                  <p className="text-[11px] text-[var(--muted)] font-light">Dijital (HH:MM) veya Klasik Analog</p>
                </div>
                <select
                  value={librarySettings.clockType}
                  onChange={(e) => setLibrarySettings(s => ({ ...s, clockType: e.target.value as any }))}
                  className="bg-black/50 text-xs text-[var(--txt)] rounded-full px-3 py-1.5 border border-white/15 outline-none"
                >
                  <option value="digital">Minimal Dijital (HH:MM)</option>
                  <option value="analog">Zarif Analog</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="btn-accent px-5 py-2 text-xs font-bold"
              >
                Kaydet & Çık
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Invite / Room Code Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="panel w-full max-w-md p-6 rounded-3xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-sm font-extrabold text-[var(--txt)]">Oda Kodu & Arkadaşlar</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-[var(--muted)] hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Senin Kütüphane Kodun</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-full px-4 py-2 font-mono text-center text-sm font-bold text-indigo-400 bg-black/30 border border-[var(--border)] tracking-widest">
                    {userProfile.roomCode}
                  </div>
                  <button
                    onClick={handleCopyRoomCode}
                    className="px-4 py-2 rounded-full text-xs font-medium border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors"
                  >
                    {copyFeedback ? 'Kopyalandı' : 'Kopyala'}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border)]">
                <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">Arkadaşının Kodunu Gir</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="Örn: FCS-992B"
                    className="flex-1 clean-input px-4 py-2 text-xs font-mono uppercase text-[var(--txt)] placeholder-white/30"
                  />
                  <button
                    onClick={handleJoinFriendRoom}
                    disabled={!joinCodeInput.trim()}
                    className="btn-accent px-4 py-2 text-xs font-bold disabled:opacity-40"
                  >
                    Katıl
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex justify-end">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-5 py-2 rounded-full text-xs font-medium text-[var(--muted)] hover:text-white"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Exit Confirmation Prompt */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="panel w-full max-w-sm p-6 rounded-3xl text-center">
            <h4 className="text-sm font-extrabold text-[var(--txt)] mb-2">Kütüphaneden Çıkılsın mı?</h4>
            <p className="text-xs text-[var(--muted)] font-light leading-relaxed mb-6">
              Kütüphane modundan çıktığınızda aktif seans durdurulacaktır.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-full text-xs text-[var(--muted)] hover:text-white border border-[var(--border)]"
              >
                Devam Et
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onExitLibrary();
                }}
                className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
              >
                Evet, Çık
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Attention Check Modal (Strict 5-Second Timer) */}
      {attentionActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg p-4 animate-fadeIn select-none">
          <div className="panel w-full max-w-md p-6 sm:p-7 rounded-[32px] text-center border-amber-500/40 shadow-2xl relative overflow-hidden">
            {/* Countdown Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-black/40">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-1000 ease-linear"
                style={{ width: `${(attentionTimeLeft / 5) * 100}%` }}
              />
            </div>

            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto mb-3 text-amber-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-[var(--txt)] tracking-tight">
              Dikkat & Odak Kontrolü
            </h3>
            <p className="text-xs text-[var(--muted)] mt-1 mb-4 font-light">
              Gerçekten masada mısın? Aşağıdaki hedef sayıyı <span className="font-extrabold text-amber-400">{attentionTimeLeft} saniye</span> içinde seç!
            </p>

            {/* Target Display */}
            <div className="py-3 px-6 rounded-2xl bg-white/5 border border-white/10 max-w-[180px] mx-auto mb-5 shadow-inner">
              <span className="text-xs uppercase tracking-widest text-[var(--muted)] block font-medium">Hedef Sayı</span>
              <span className="text-4xl font-black text-amber-300 font-mono tracking-wider">{attentionTarget}</span>
            </div>

            {/* Choices Grid */}
            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
              {attentionOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectAttentionOption(opt)}
                  className="py-3 px-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-amber-400 text-lg font-black font-mono text-[var(--txt)] hover:bg-amber-500/15 active:scale-95 transition-all shadow-md"
                >
                  {opt}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-rose-400/80 font-medium mt-4">
              Yanlış seçim veya süre aşımı: Odak seansı sonlandırılır ve puan kesintisi uygulanır!
            </p>
          </div>
        </div>
      )}

      {/* 7. Striking Kick-Out Warning Modal */}
      {showAttentionWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-fadeIn select-none">
          <div className="panel w-full max-w-lg p-6 sm:p-8 rounded-[32px] text-center border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.35)]">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-rose-300 tracking-tight mb-3">
              DİKKATİNİZ DAĞILDI & KÜTÜPHANEDEN ÇIKARILDINIZ!
            </h3>

            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs sm:text-sm text-rose-200 font-medium leading-relaxed mb-5">
              “Lütfen çalışmanıza dikkat edin! Doğru düzgün çalışmıyorsunuz ve şu anda odakta değilsiniz. Lütfen kendinizi ve bizi kandırmayın...”
            </div>

            <div className="space-y-2 mb-6 text-xs text-[var(--muted)]">
              <div className="flex items-center justify-center gap-2">
                <span className="text-rose-400 font-bold">-80 Odak Puanı</span>
                <span>kesintisi yapıldı.</span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 flex items-center justify-center gap-2">
                <span className="font-bold text-rose-300">Ceza Süresi:</span>
                <span className="font-mono font-bold text-rose-100">{Math.ceil(calculatedPenaltySec / 60)} Dakika</span>
                <span className="text-[11px] text-rose-300/70 ml-1">• Kütüphane ve görevler kilitlendi</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowAttentionWarning(false);
                onExitLibrary();
              }}
              className="w-full py-3.5 px-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm transition-all shadow-lg active:scale-98"
            >
              Anladım, Kütüphaneden Ayrıl
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
