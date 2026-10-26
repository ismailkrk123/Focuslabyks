export type ThemeMode = 'dark' | 'light';

export type YksField = 'Sayısal' | 'Eşit Ağırlık' | 'Sözel' | 'Dil';

export interface AuthAccount {
  isAuthenticated: boolean;
  isGuest: boolean;
  username: string;
  email: string;
  name: string;
  targetExamRank: string;
  targetDepartment?: string;
  yksField: YksField;
  onboardingCompleted: boolean;
  createdAt: number;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskCard {
  id: string;
  title: string;
  description: string;
  category: 'task' | 'event' | 'todo';
  completed: boolean;
  color: string;
  pillColor?: string;
  width: number;
  height: number;
  x: number;
  y: number;
  durationMinutes: number;
  scheduledTime?: string; // HH:mm format (e.g. "14:30")
  date: string; // YYYY-MM-DD
  subtasks: SubTask[];
  createdAt: number;
}

export interface AmbientTrack {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  durationSec: number;
  type: 'rain' | 'waves' | 'forest' | 'fire' | 'lofi' | 'whitenoise' | 'cafe';
}

export interface SubjectResult {
  name: string;
  maxQuestions: number;
  correct: number;
  wrong: number;
  empty: number;
  net: number;
}

export interface DenemeRecord {
  id: string;
  title: string;
  type: 'TYT' | 'AYT';
  date: string;
  totalQuestions: number;
  totalNet: number;
  subjects: SubjectResult[];
  notes?: string;
}

export interface LibrarySettings {
  showClock: boolean;
  showPomodoro: boolean;
  showStopwatch: boolean;
  clockType: 'digital' | 'analog';
  backgroundPreset: string;
  customBackgroundUrl: string;
}

export interface StudyFriend {
  id: string;
  name: string;
  status: 'focus' | 'break';
  points: number;
  avatarColor: string;
  deskStyle: number;
}

export interface UserProfile {
  name: string;
  targetGoal: string;
  targetExamRank: string;
  targetDepartment?: string;
  yksField: YksField;
  totalFocusMinutes: number;
  treePoints: number;
  roomCode: string;
  friends: StudyFriend[];
  themeMode: ThemeMode;
}

export interface PenaltyState {
  isActive: boolean;
  secondsLeft: number;
  totalDuration: number;
  failureCount: number;
  consecutiveSuccessStreak: number;
}

