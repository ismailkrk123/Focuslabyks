import {
  TaskCard,
  AmbientTrack,
  DenemeRecord,
  LibrarySettings,
  UserProfile,
  AuthAccount,
  PenaltyState
} from '../types';

export const INITIAL_PENALTY_STATE: PenaltyState = {
  isActive: false,
  secondsLeft: 0,
  totalDuration: 0,
  failureCount: 0,
  consecutiveSuccessStreak: 0
};

export const TRACK_LIST: AmbientTrack[] = [
  {
    id: 'track-1',
    title: 'Yağmurlu Pencere Kenarı',
    subtitle: 'Doğal Yağmur & Damla Sesleri',
    category: 'Doğa',
    durationSec: 1800,
    type: 'rain'
  },
  {
    id: 'track-2',
    title: 'Gece Okyanus Dalgaları',
    subtitle: 'Ritmik Kıyı Kırılmaları & Derin Dalga',
    category: 'Su',
    durationSec: 1800,
    type: 'waves'
  },
  {
    id: 'track-3',
    title: 'Çam Ormanı Esintisi',
    subtitle: 'Hafif Rüzgar & Uzak Kuş Sesleri',
    category: 'Doğa',
    durationSec: 1800,
    type: 'forest'
  },
  {
    id: 'track-4',
    title: 'Kütük Şömine Çatırtısı',
    subtitle: 'Sıcak Kor Ateşi & Odun Çıtırtısı',
    category: 'Rahat',
    durationSec: 1800,
    type: 'fire'
  },
  {
    id: 'track-5',
    title: 'Derin Odak Lo-Fi Akorları',
    subtitle: 'Sakin Synth Pedleri & Yumuşak Ritim',
    category: 'Müzik',
    durationSec: 1800,
    type: 'lofi'
  },
  {
    id: 'track-6',
    title: 'Saf Kahverengi Gürültü (Brown Noise)',
    subtitle: 'Zihni Susturan Derin Rezonans',
    category: 'Odak',
    durationSec: 1800,
    type: 'whitenoise'
  },
  {
    id: 'track-7',
    title: 'Eski Şehir Kafe Ambiyansı',
    subtitle: 'Fincan Tıkırtıları & Sessiz Çalışma',
    category: 'Şehir',
    durationSec: 1800,
    type: 'cafe'
  }
];

export const INITIAL_TASKS: TaskCard[] = [
  {
    id: 'task-1',
    title: 'Matematik: Türev & İntegral Tekrarı',
    description: 'Son 5 yılın çıkmış sorularını analiz et ve 40 problem çöz.',
    category: 'task',
    completed: false,
    color: '#1a1d2e',
    width: 290,
    height: 185,
    x: 40,
    y: 30,
    durationMinutes: 90,
    scheduledTime: '10:00',
    date: new Date().toISOString().split('T')[0],
    subtasks: [
      { id: 'sub-1', title: 'Teorik formül kartlarını gözden geçir', completed: true },
      { id: 'sub-2', title: 'ÖSYM tarzı 25 soru çöz', completed: false },
      { id: 'sub-3', title: 'Yanlış soruların video çözümünü izle', completed: false }
    ],
    createdAt: Date.now() - 100000
  },
  {
    id: 'task-2',
    title: 'Türkçe: Paragraf Hız Denemesi',
    description: '30 dakikada 25 soru paragraf taktikleri ve süre yönetimi.',
    category: 'task',
    completed: true,
    color: '#1a1d2e',
    width: 280,
    height: 175,
    x: 360,
    y: 30,
    durationMinutes: 30,
    scheduledTime: '13:00',
    date: new Date().toISOString().split('T')[0],
    subtasks: [
      { id: 'sub-4', title: 'Süre tutarak 25 soru çöz', completed: true },
      { id: 'sub-5', title: 'Ana düşünce ve yardımcı düşünce analizi', completed: true }
    ],
    createdAt: Date.now() - 80000
  },
  {
    id: 'task-3',
    title: 'Fizik: Elektrik ve Manyetizma',
    description: 'İndüksiyon akımı ve manyetik akı konu özet defterini doldur.',
    category: 'event',
    completed: false,
    color: '#1a1d2e',
    width: 300,
    height: 185,
    x: 40,
    y: 250,
    durationMinutes: 60,
    scheduledTime: '15:30',
    date: new Date().toISOString().split('T')[0],
    subtasks: [
      { id: 'sub-6', title: 'Sağ el kuralı pratikleri', completed: false },
      { id: 'sub-7', title: 'Örnek soru çözümü', completed: false }
    ],
    createdAt: Date.now() - 60000
  },
  {
    id: 'task-4',
    title: 'Haftalık TYT Denemesi Analizi',
    description: 'Yanlışların konu dağılımını çıkart ve çalışma planına ekle.',
    category: 'todo',
    completed: false,
    color: '#1a1d2e',
    width: 290,
    height: 170,
    x: 360,
    y: 250,
    durationMinutes: 45,
    scheduledTime: '18:00',
    date: new Date().toISOString().split('T')[0],
    subtasks: [
      { id: 'sub-8', title: 'Türkçe & Sosyal net kontrolü', completed: true },
      { id: 'sub-9', title: 'Fen yanlış defterine not al', completed: false }
    ],
    createdAt: Date.now() - 40000
  }
];

export const INITIAL_DENEMELER: DenemeRecord[] = [
  {
    id: 'deneme-1',
    title: 'Özdebir Türkiye Geneli TYT - 1',
    type: 'TYT',
    date: '2026-10-12',
    totalQuestions: 120,
    totalNet: 88.75,
    subjects: [
      { name: 'Türkçe', maxQuestions: 40, correct: 33, wrong: 5, empty: 2, net: 31.75 },
      { name: 'Sosyal Bilimler', maxQuestions: 20, correct: 16, wrong: 3, empty: 1, net: 15.25 },
      { name: 'Temel Matematik', maxQuestions: 40, correct: 28, wrong: 4, empty: 8, net: 27.00 },
      { name: 'Fen Bilimleri', maxQuestions: 20, correct: 15, wrong: 1, empty: 4, net: 14.75 }
    ],
    notes: 'Geometri süresi yetmedi, paragraf çözümü oldukça akıcıydı.'
  },
  {
    id: 'deneme-2',
    title: '3D Simülasyon TYT - 2',
    type: 'TYT',
    date: '2026-10-19',
    totalQuestions: 120,
    totalNet: 94.50,
    subjects: [
      { name: 'Türkçe', maxQuestions: 40, correct: 35, wrong: 3, empty: 2, net: 34.25 },
      { name: 'Sosyal Bilimler', maxQuestions: 20, correct: 17, wrong: 2, empty: 1, net: 16.50 },
      { name: 'Temel Matematik', maxQuestions: 40, correct: 30, wrong: 3, empty: 7, net: 29.25 },
      { name: 'Fen Bilimleri', maxQuestions: 20, correct: 15, wrong: 2, empty: 3, net: 14.50 }
    ],
    notes: 'Matematikte problem sorularında süre arttı, fen tekrarı gerekiyor.'
  }
];

export const MOTIVATIONAL_QUOTES = [
  {
    quote: "Hayatta en hakiki mürşit ilimdir, fendir. İlim ve fenden başka yol gösterici aramak gaflettir.",
    author: "Mustafa Kemal Atatürk"
  },
  {
    quote: "Benim özel bir yeteneğim yok. Yalnızca tutkulu bir şekilde meraklıyım ve pes etmiyorum.",
    author: "Albert Einstein"
  },
  {
    quote: "Sabah uyandığında nefes almanın, düşünmenin, zevk almanın ve üretmenin ne büyük bir hediye olduğunu hatırla.",
    author: "Marcus Aurelius"
  },
  {
    quote: "Dünle beraber gitti cancağızım, ne kadar söz varsa düne ait. Şimdi yeni şeyler söylemek, yeni adımlar atmak lazım.",
    author: "Mevlana Celaleddin Rumi"
  },
  {
    quote: "Zamanımızın az olması değil mesele, çoğunu erteleyerek ve kararsızlıkla israf ediyor olmamızdır.",
    author: "Seneca"
  },
  {
    quote: "Gelecek, bugünden ona hazırlanan ve hayallerinin güzelliğine inananlarındır.",
    author: "Marie Curie"
  }
];

export const NATURE_BACKGROUNDS = [
  {
    id: 'bg-rain-window',
    title: 'Yağmurlu Pencere',
    url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=2000&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=300&q=70'
  },
  {
    id: 'bg-pine-fog',
    title: 'Sisli Çam Ormanı',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2000&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=300&q=70'
  },
  {
    id: 'bg-warm-library',
    title: 'Klasik Ahşap Kütüphane',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=2000&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=300&q=70'
  },
  {
    id: 'bg-cozy-desk',
    title: 'Sakin Çalışma Masası',
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=2000&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=300&q=70'
  }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Focus Gezgini',
  targetGoal: 'YKS 2026 - Tıp & Mühendislik',
  targetExamRank: 'İlk 5.000',
  yksField: 'Sayısal',
  totalFocusMinutes: 480,
  treePoints: 160,
  roomCode: 'FCS-849X',
  friends: [
    { id: 'f-1', name: 'Zeynep K.', status: 'focus', points: 940, avatarColor: '#6366f1', deskStyle: 1 },
    { id: 'f-2', name: 'Mert Demir', status: 'focus', points: 820, avatarColor: '#8b5cf6', deskStyle: 2 },
    { id: 'f-3', name: 'Elif Yılmaz', status: 'break', points: 610, avatarColor: '#10b981', deskStyle: 3 }
  ],
  themeMode: 'dark'
};

export const INITIAL_AUTH_ACCOUNT: AuthAccount = {
  isAuthenticated: false,
  isGuest: false,
  username: '',
  email: '',
  name: '',
  targetExamRank: 'İlk 5.000',
  yksField: 'Sayısal',
  onboardingCompleted: false,
  createdAt: Date.now()
};

export const INITIAL_LIBRARY_SETTINGS: LibrarySettings = {
  showClock: true,
  showPomodoro: true,
  showStopwatch: true,
  clockType: 'digital',
  backgroundPreset: 'bg-pine-fog',
  customBackgroundUrl: ''
};

// Storage keys
const STORAGE_PREFIX = 'focuslab_v3_';

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.warn('Storage save failed:', err);
  }
}

export function clearAllStorage(): void {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // ignore
  }
}
