import React, { useState, useRef, useEffect } from 'react';
import { Settings, BookOpen, Sun, Moon } from 'lucide-react';
import { ThemeMode } from '../types';

interface LiquidNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSettings: () => void;
  onOpenLibraryGate: () => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

export const LiquidNavbar: React.FC<LiquidNavbarProps> = ({
  activeTab,
  setActiveTab,
  openSettings,
  onOpenLibraryGate,
  themeMode,
  setThemeMode
}) => {
  const [isAuraActive, setIsAuraActive] = useState<boolean>(false);
  const auraTimeoutRef = useRef<number | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const [navDims, setNavDims] = useState<{ w: number; h: number }>({ w: 460, h: 42 });

  const hasScrolledDownRef = useRef<boolean>(false);

  const triggerAura = () => {
    if (navRef.current) {
      setNavDims({
        w: navRef.current.offsetWidth,
        h: navRef.current.offsetHeight
      });
    }
    setIsAuraActive(true);
    if (auraTimeoutRef.current) {
      window.clearTimeout(auraTimeoutRef.current);
    }
    // Glows and loops for 3.5 seconds, then cleanly fades out
    auraTimeoutRef.current = window.setTimeout(() => {
      setIsAuraActive(false);
    }, 3500);
  };

  // 1. Initial mount trigger
  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      triggerAura();
    }, 400);
    return () => clearTimeout(initialTimer);
  }, []);

  // 2. Trigger ONLY when user scrolls down and returns all the way back to top
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > 60) {
        hasScrolledDownRef.current = true;
      } else if (currentY <= 10 && hasScrolledDownRef.current) {
        hasScrolledDownRef.current = false;
        triggerAura();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navTabs = [
    { id: 'home', label: 'Ana Sayfa' },
    { id: 'tasks', label: 'Görevler' },
    { id: 'calendar', label: 'Takvim' },
    { id: 'progress', label: 'İlerleme' },
    { id: 'focus', label: 'Odak' },
    { id: 'todo', label: 'To-Do' }
  ];

  const toggleTheme = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const isLight = themeMode === 'light';

  return (
    <header className="sticky top-3.5 z-50 w-full px-2 sm:px-4 max-w-6xl mx-auto flex items-center justify-between gap-2.5 pointer-events-none transition-all">
      {/* 1. SEPARATE BRAND CAPSULE (Outside nav panel, comfortably sized - NO Google animation here) */}
      <div 
        onClick={() => {
          setActiveTab('home');
        }}
        className="pointer-events-auto glass glass-nav rounded-full py-2 px-3.5 sm:px-4 flex items-center gap-2.5 cursor-pointer shadow-md hover:border-white/30 transition-all select-none shrink-0"
        title="FocusLab Ana Sayfa"
      >
        {/* FocusLab Halo Ring Logo */}
        <img 
          src="/assets/aistudio/f576c254fbf3892432392f40d43590062487875e061c358c4f10314d74ecd00e_40e06333.png" 
          alt="FocusLab Halo" 
          className="w-5 h-5 rounded-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.85)] shrink-0"
        />
        <span className="font-extrabold tracking-tight text-xs sm:text-sm">
          FocusLab
        </span>
      </div>

      {/* 2. NAVIGATION TABS PANEL ONLY (Continuous unbroken Google perimeter stroke loop) */}
      <nav 
        ref={navRef}
        className="relative pointer-events-auto glass glass-nav rounded-full py-1.5 px-2 flex items-center justify-center gap-1 sm:gap-1.5 shadow-md shrink-0 max-w-full"
      >
        {/* Exact perimeter outer border trace: Harmonious Google + Aurora gradient spectrum seamlessly following each other */}
        {isAuraActive && (
          <svg 
            className="pointer-events-none absolute -inset-[1px] overflow-visible z-20 google-aura-fade"
            style={{
              width: navDims.w + 2,
              height: navDims.h + 2
            }}
            viewBox={`0 0 ${navDims.w + 2} ${navDims.h + 2}`}
          >
            {/* 1. Luminous Royal Blue */}
            <rect 
              x="1" 
              y="1" 
              width={navDims.w} 
              height={navDims.h} 
              rx={navDims.h / 2} 
              fill="none" 
              stroke="#3b82f6" 
              strokeWidth="1.4" 
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray="17.2 82.8"
              className="google-loop-blue"
            />
            {/* 2. Soft Violet / Purple Bridge */}
            <rect 
              x="1" 
              y="1" 
              width={navDims.w} 
              height={navDims.h} 
              rx={navDims.h / 2} 
              fill="none" 
              stroke="#8b5cf6" 
              strokeWidth="1.4" 
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray="17.2 82.8"
              className="google-loop-purple"
            />
            {/* 3. Coral Red / Crimson */}
            <rect 
              x="1" 
              y="1" 
              width={navDims.w} 
              height={navDims.h} 
              rx={navDims.h / 2} 
              fill="none" 
              stroke="#ef4444" 
              strokeWidth="1.4" 
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray="17.2 82.8"
              className="google-loop-red"
            />
            {/* 4. Warm Amber / Sunset Orange */}
            <rect 
              x="1" 
              y="1" 
              width={navDims.w} 
              height={navDims.h} 
              rx={navDims.h / 2} 
              fill="none" 
              stroke="#f59e0b" 
              strokeWidth="1.4" 
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray="17.2 82.8"
              className="google-loop-amber"
            />
            {/* 5. Mint / Emerald Green */}
            <rect 
              x="1" 
              y="1" 
              width={navDims.w} 
              height={navDims.h} 
              rx={navDims.h / 2} 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="1.4" 
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray="17.2 82.8"
              className="google-loop-green"
            />
            {/* 6. Cyan / Sky Blue Bridge */}
            <rect 
              x="1" 
              y="1" 
              width={navDims.w} 
              height={navDims.h} 
              rx={navDims.h / 2} 
              fill="none" 
              stroke="#06b6d4" 
              strokeWidth="1.4" 
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray="17.2 82.8"
              className="google-loop-cyan"
            />
          </svg>
        )}

        {navTabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={(e) => {
                e.stopPropagation();
                handleTabClick(tab.id);
              }}
              className={`py-1.5 px-3 sm:px-3.5 rounded-full text-xs sm:text-[13px] transition-all whitespace-nowrap relative z-10 ${
                isActive
                  ? isLight
                    ? 'bg-slate-900 text-white font-extrabold shadow-sm'
                    : 'bg-white/20 text-white font-extrabold shadow-sm'
                  : 'hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* 3. RIGHT ACTIONS PANEL (Sanal Kütüphane + Theme Toggle + Ayarlar) */}
      <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Sanal Kütüphane Button */}
        <button
          onClick={onOpenLibraryGate}
          className="glass glass-nav rounded-full py-2 px-3 sm:px-3.5 flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold hover:border-white/30 transition-all shadow-md"
          title="Sanal Kütüphane & Odak Bahçesi"
        >
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Kütüphane</span>
        </button>

        {/* Dark / Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          aria-label="Tema Değiştir"
          className="w-9 h-9 rounded-full glass glass-nav flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md"
          title={themeMode === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
        >
          {themeMode === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-300" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Ayarlar Button */}
        <button
          onClick={openSettings}
          aria-label="Ayarlar"
          className="w-9 h-9 rounded-full glass glass-nav flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md group"
          title="Ayarlar & Profil"
        >
          <Settings className="w-4 h-4 text-[var(--muted)] group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
    </header>
  );
};
