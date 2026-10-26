import React, { useState, useEffect } from 'react';
import { 
  TaskCard, 
  UserProfile, 
  LibrarySettings, 
  DenemeRecord, 
  AuthAccount,
  ThemeMode,
  PenaltyState
} from './types';
import { 
  INITIAL_TASKS, 
  INITIAL_USER_PROFILE, 
  INITIAL_LIBRARY_SETTINGS, 
  INITIAL_DENEMELER, 
  INITIAL_AUTH_ACCOUNT,
  INITIAL_PENALTY_STATE,
  loadFromStorage, 
  saveToStorage, 
  clearAllStorage 
} from './services/storage';

// Components
import { LiquidNavbar } from './components/LiquidNavbar';
import { HomeDashboard } from './components/HomeDashboard';
import { TaskBoard } from './components/TaskBoard';
import { TodoListTab } from './components/TodoListTab';
import { FocusTab } from './components/FocusTab';
import { CalendarView } from './components/CalendarView';
import { ProgressView } from './components/ProgressView';
import { VirtualLibrary } from './components/VirtualLibrary';
import { MiniAudioPlayer } from './components/MiniAudioPlayer';
import { AIAssistant } from './components/AIAssistant';
import { SettingsModal } from './components/SettingsModal';
import { LibraryGateModal } from './components/LibraryGateModal';
import { AuthModal } from './components/AuthModal';
import { SnowfallBackground } from './components/SnowfallBackground';
import { PenaltyCountdownWidget } from './components/PenaltyCountdownWidget';
import { FocusAIPanel } from './components/FocusAIPanel';
import { 
  auth, 
  onAuthStateChanged, 
  syncUserProfileToFirestore, 
  fetchUserProfileFromFirestore 
} from './services/firebase';

export default function App() {
  // Auth state
  const [authAccount, setAuthAccount] = useState<AuthAccount>(() => 
    loadFromStorage<AuthAccount>('auth_account', INITIAL_AUTH_ACCOUNT)
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => 
    !authAccount.isAuthenticated || !authAccount.onboardingCompleted
  );

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('home');

  // Virtual Library full-screen immersion mode
  const [isLibraryActive, setIsLibraryActive] = useState<boolean>(false);
  const [isLibraryGateOpen, setIsLibraryGateOpen] = useState<boolean>(false);
  const [penaltyWarningToast, setPenaltyWarningToast] = useState<string | null>(null);

  // Focus AI Full-Page Assistant state
  const [isFocusAIOpen, setIsFocusAIOpen] = useState<boolean>(false);

  // Settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Core Data models
  const [tasks, setTasks] = useState<TaskCard[]>(() => 
    loadFromStorage<TaskCard[]>('tasks', INITIAL_TASKS)
  );
  const [userProfile, setUserProfile] = useState<UserProfile>(() => 
    loadFromStorage<UserProfile>('profile', INITIAL_USER_PROFILE)
  );
  const [librarySettings, setLibrarySettings] = useState<LibrarySettings>(() => 
    loadFromStorage<LibrarySettings>('library_settings', INITIAL_LIBRARY_SETTINGS)
  );
  const [denemeler, setDenemeler] = useState<DenemeRecord[]>(() => 
    loadFromStorage<DenemeRecord[]>('denemeler', INITIAL_DENEMELER)
  );

  // Penalty & Cooldown state
  const [penaltyState, setPenaltyState] = useState<PenaltyState>(() => 
    loadFromStorage<PenaltyState>('penalty_state', INITIAL_PENALTY_STATE)
  );

  // 1-second countdown ticker for penalty
  useEffect(() => {
    if (!penaltyState.isActive || penaltyState.secondsLeft <= 0) return;
    const interval = window.setInterval(() => {
      setPenaltyState(prev => {
        if (prev.secondsLeft <= 1) {
          return {
            ...prev,
            isActive: false,
            secondsLeft: 0
          };
        }
        return {
          ...prev,
          secondsLeft: prev.secondsLeft - 1
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [penaltyState.isActive, penaltyState.secondsLeft]);

  // Pointermove listener updating --mx and --my on hover over .glass elements
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const el = (e.target as HTMLElement)?.closest?.('.glass') as HTMLElement | null;
      if (el) {
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        el.style.setProperty('--my', `${e.clientY - rect.top}px`);
      }
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  // Auto-sync state to localStorage
  useEffect(() => {
    saveToStorage('auth_account', authAccount);
  }, [authAccount]);

  useEffect(() => {
    saveToStorage('tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    saveToStorage('profile', userProfile);
  }, [userProfile]);

  useEffect(() => {
    saveToStorage('library_settings', librarySettings);
  }, [librarySettings]);

  useEffect(() => {
    saveToStorage('denemeler', denemeler);
  }, [denemeler]);

  useEffect(() => {
    saveToStorage('penalty_state', penaltyState);
  }, [penaltyState]);

  // Firebase Auth State Listener & Cloud Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setAuthAccount(prev => ({
          ...prev,
          isAuthenticated: true,
          isGuest: false,
          email: firebaseUser.email || prev.email,
          name: firebaseUser.displayName || prev.name,
          username: firebaseUser.displayName || prev.username
        }));

        try {
          const cloudProfile = await fetchUserProfileFromFirestore(firebaseUser.uid);
          if (cloudProfile) {
            setUserProfile(prev => ({
              ...prev,
              ...cloudProfile,
              name: cloudProfile.name || prev.name
            }));
          }
        } catch {
          // ignore offline/permission during init
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync profile to Firestore when authenticated with Google/Firebase
  useEffect(() => {
    if (auth.currentUser && !authAccount.isGuest) {
      syncUserProfileToFirestore(auth.currentUser.uid, userProfile).catch(() => {});
    }
  }, [userProfile, authAccount.isGuest]);

  // Penalty & Cooldown handlers
  const handleRequestOpenLibrary = () => {
    if (penaltyState.isActive && penaltyState.secondsLeft > 0) {
      setPenaltyWarningToast(`Ceza Süresi: Kalan süre ${Math.ceil(penaltyState.secondsLeft / 60)} dakika. Kütüphane kilitlidir.`);
      setTimeout(() => setPenaltyWarningToast(null), 3500);
      return;
    }
    setIsLibraryGateOpen(true);
  };

  const handlePenaltyTriggered = (durationSec: number) => {
    setPenaltyState(prev => {
      const newFailures = prev.failureCount + 1;
      return {
        isActive: true,
        secondsLeft: durationSec,
        totalDuration: durationSec,
        failureCount: newFailures,
        consecutiveSuccessStreak: 0
      };
    });
  };

  const handleCorrectAttentionCheck = () => {
    setPenaltyState(prev => {
      const newStreak = prev.consecutiveSuccessStreak + 1;
      if (newStreak >= 5) {
        // 5 consecutive correct answers: clear penalty and failure tier completely
        return {
          isActive: false,
          secondsLeft: 0,
          totalDuration: 0,
          failureCount: 0,
          consecutiveSuccessStreak: 0
        };
      }
      return {
        ...prev,
        consecutiveSuccessStreak: newStreak
      };
    });
  };

  // Session completion reward: awards tree points
  const handleSessionComplete = (durationMinutes: number) => {
    const earnedPoints = Math.round(durationMinutes * 1.5);
    setUserProfile(prev => ({
      ...prev,
      totalFocusMinutes: prev.totalFocusMinutes + durationMinutes,
      treePoints: prev.treePoints + earnedPoints
    }));
  };

  const handleSetThemeMode = (mode: ThemeMode) => {
    setUserProfile(prev => ({ ...prev, themeMode: mode }));
  };

  // Add task for specific date / hour from Calendar
  const handleAddTaskForDate = (date: string, hour?: string) => {
    const newTask: TaskCard = {
      id: 'task-' + Date.now(),
      title: 'Planlanan çalışma seansı',
      description: 'Takvimden eklenen odak hedefi.',
      category: 'task',
      completed: false,
      color: '#1a1d2e',
      width: 290,
      height: 175,
      x: 30,
      y: 30,
      durationMinutes: 45,
      scheduledTime: hour || '14:00',
      date: date,
      subtasks: [
        { id: 'sub-' + Date.now(), title: 'Konu tekrarı ve soru çözümü', completed: false }
      ],
      createdAt: Date.now()
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleToggleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  // AI Task suggestion callback
  const handleSuggestTask = (title: string, durationMinutes: number) => {
    const newTask: TaskCard = {
      id: 'task-ai-' + Date.now(),
      title,
      description: 'FocusAI tarafından önerilen optimize çalışma bloğu.',
      category: 'task',
      completed: false,
      color: '#1a1d2e',
      width: 290,
      height: 175,
      x: 40,
      y: 40,
      durationMinutes,
      scheduledTime: '16:00',
      date: new Date().toISOString().split('T')[0],
      subtasks: [
        { id: 'sub-ai-1', title: 'İlk 20 dakika soru çözümü', completed: false },
        { id: 'sub-ai-2', title: 'Hataların analiz edilmesi', completed: false }
      ],
      createdAt: Date.now()
    };
    setTasks(prev => [newTask, ...prev]);
  };

  // Clear all data
  const handleClearAllData = () => {
    clearAllStorage();
    setTasks(INITIAL_TASKS);
    setUserProfile(INITIAL_USER_PROFILE);
    setLibrarySettings(INITIAL_LIBRARY_SETTINGS);
    setDenemeler(INITIAL_DENEMELER);
    setAuthAccount(INITIAL_AUTH_ACCOUNT);
    setIsAuthModalOpen(true);
  };

  const isLight = userProfile.themeMode === 'light';

  return (
    <div className={`min-h-screen relative overflow-x-clip transition-colors duration-300 ${isLight ? 'theme-light bg-[#f8f9fc] text-[#151824]' : 'bg-[#0c0e15] text-[#f1f3f9]'}`}>
      {/* 1. Delicate Falling Snowflakes Background (accelerates with scroll, deep charcoal gray backdrop) */}
      <SnowfallBackground themeMode={userProfile.themeMode} />

      {/* Floating Penalty Lock Warning Toast */}
      {penaltyWarningToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 py-2.5 px-6 rounded-full bg-rose-600/90 text-white font-semibold text-xs shadow-2xl backdrop-blur-md animate-fadeIn flex items-center gap-2">
          <span>⚠️</span>
          <span>{penaltyWarningToast}</span>
        </div>
      )}

      {/* 2. Main Content Area */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Sticky Liquid Glass Top Navigation Bar */}
        <LiquidNavbar
          activeTab={activeTab === 'denemeler' ? 'progress' : activeTab}
          setActiveTab={setActiveTab}
          openSettings={() => setIsSettingsOpen(true)}
          onOpenLibraryGate={handleRequestOpenLibrary}
          themeMode={userProfile.themeMode}
          setThemeMode={handleSetThemeMode}
        />

        {/* Tab Pages: Responsive Container adapting to any screen */}
        <main className="flex-1 w-full px-2 sm:px-4 md:px-6 max-w-7xl mx-auto pt-4 sm:pt-6 pb-24">
          {activeTab === 'home' && (
            <HomeDashboard
              tasks={tasks}
              userProfile={userProfile}
              denemeler={denemeler}
              onOpenLibraryGate={handleRequestOpenLibrary}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskBoard
              tasks={tasks}
              setTasks={setTasks}
              filterCategory="all"
              isPenaltyActive={penaltyState.isActive}
            />
          )}

          {activeTab === 'todo' && (
            <TodoListTab
              tasks={tasks}
              setTasks={setTasks}
            />
          )}

          {activeTab === 'focus' && (
            <FocusTab
              onSessionComplete={handleSessionComplete}
              treePoints={userProfile.treePoints}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              tasks={tasks}
              onAddTaskForDate={handleAddTaskForDate}
              onToggleTaskComplete={handleToggleTaskComplete}
            />
          )}

          {(activeTab === 'progress' || activeTab === 'denemeler') && (
            <ProgressView
              tasks={tasks}
              userProfile={userProfile}
              denemeler={denemeler}
              setDenemeler={setDenemeler}
            />
          )}
        </main>

        {/* Floating Circular Penalty Countdown Widget completing as time elapses */}
        {penaltyState.isActive && penaltyState.secondsLeft > 0 && (
          <PenaltyCountdownWidget
            secondsLeft={penaltyState.secondsLeft}
            totalDuration={penaltyState.totalDuration}
            failureCount={penaltyState.failureCount}
            consecutiveSuccessStreak={penaltyState.consecutiveSuccessStreak}
          />
        )}

        {/* Global Bottom-Right Floating Ambient Audio Player (auto-fades on inactivity) */}
        <MiniAudioPlayer />

        {/* Global Bottom-Left Floating AI Assistant (auto-fades on inactivity) */}
        <AIAssistant 
          onSuggestTask={handleSuggestTask} 
          onOpenFocusAI={() => setIsFocusAIOpen(true)}
        />
      </div>

      {/* Fullscreen Virtual Library Mode */}
      {isLibraryActive && (
        <VirtualLibrary
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          librarySettings={librarySettings}
          setLibrarySettings={setLibrarySettings}
          onExitLibrary={() => setIsLibraryActive(false)}
          onSessionComplete={handleSessionComplete}
          onPenaltyTriggered={handlePenaltyTriggered}
          onCorrectAttentionCheck={handleCorrectAttentionCheck}
          failureCount={penaltyState.failureCount}
        />
      )}

      {/* Pre-entry Library Gate Modal */}
      <LibraryGateModal
        isOpen={isLibraryGateOpen}
        onClose={() => setIsLibraryGateOpen(false)}
        onStartLibrary={() => setIsLibraryActive(true)}
        userName={userProfile.name}
      />

      {/* Full-Page Focus AI Voice & Text Assistant Panel */}
      <FocusAIPanel
        isOpen={isFocusAIOpen}
        onClose={() => setIsFocusAIOpen(false)}
        userProfile={userProfile}
        tasks={tasks}
        denemeler={denemeler}
        onAddTask={handleSuggestTask}
      />

      {/* Settings & Profile Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        authAccount={authAccount}
        setAuthAccount={setAuthAccount}
        onClearAllData={handleClearAllData}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Auth & Onboarding Gateway Modal */}
      {isAuthModalOpen && (
        <AuthModal
          authAccount={authAccount}
          setAuthAccount={setAuthAccount}
          setUserProfile={setUserProfile}
          onComplete={() => setIsAuthModalOpen(false)}
        />
      )}
    </div>
  );
}
