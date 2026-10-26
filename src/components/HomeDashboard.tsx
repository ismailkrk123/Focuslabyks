import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Timer, 
  TrendingUp, 
  Quote, 
  ChevronRight, 
  Target,
  ArrowRight
} from 'lucide-react';
import { TaskCard, UserProfile, DenemeRecord } from '../types';
import { MOTIVATIONAL_QUOTES } from '../services/storage';

interface HomeDashboardProps {
  tasks: TaskCard[];
  userProfile: UserProfile;
  denemeler: DenemeRecord[];
  onOpenLibraryGate: () => void;
  onNavigateTab: (tab: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  tasks,
  userProfile,
  denemeler,
  onOpenLibraryGate,
  onNavigateTab
}) => {
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const activeQuote = MOTIVATIONAL_QUOTES[quoteIndex % MOTIVATIONAL_QUOTES.length];

  const pendingTasks = tasks.filter(t => !t.completed);
  const latestDeneme = denemeler[denemeler.length - 1];

  const handleNextQuote = () => {
    setQuoteIndex(q => (q + 1) % MOTIVATIONAL_QUOTES.length);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5 select-none px-2 sm:px-4">
      {/* Minimalist Slender Quote Capsule */}
      <div className="py-2 px-3.5 sm:px-4 rounded-full border border-[var(--border)] bg-[var(--surface)] backdrop-blur-md shadow-sm max-w-2xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <Quote className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <p className="text-[11px] sm:text-xs font-light text-[var(--txt)] truncate italic">
            “{activeQuote.quote}” <span className="text-[var(--muted)] not-italic ml-1 font-normal">— {activeQuote.author}</span>
          </p>
        </div>

        <button
          onClick={handleNextQuote}
          className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--txt)] hover:bg-white/10 active:scale-95 transition-all shrink-0"
          title="Sıradaki alıntı"
          aria-label="Sıradaki alıntı"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Focus Hero Launch Panel */}
      <div className="panel p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--txt)] text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span>Sanal Kütüphane & Etüt Salonu</span>
          </div>
          <h1 className="text-[clamp(1.9rem,4.5vw,3.2rem)] font-extrabold text-[var(--txt)] tracking-tight leading-none">
            Derin odaklanmaya hazır mısın?
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] font-light leading-relaxed">
            Tam ekran dikkatsiz etüt alanı, lo-fi ve doğa sesleri çaları, gün gün büyüyen odak ağacı ve arkadaşlarınla ortak çalışma odası.
          </p>
        </div>

        <button
          onClick={onOpenLibraryGate}
          className="btn-accent py-3.5 px-8 font-extrabold text-xs sm:text-sm flex items-center gap-2.5 shrink-0 group shadow-lg"
        >
          <BookOpen className="w-4 h-4" />
          <span>Etüde Başla</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Metrics Row: Crisp metric-box with 14px corners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div 
          onClick={() => onNavigateTab('tasks')}
          className="metric-box p-4 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--muted)]">Bekleyen Görevler</span>
            <div className="w-7 h-7 rounded-full bg-[var(--surface)] border border-[var(--border)] text-indigo-400 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[var(--txt)] tracking-tight mt-2">{pendingTasks.length} Kutucuk</p>
          <p className="text-[10px] text-[var(--muted)] mt-1 flex items-center gap-1 group-hover:text-[var(--txt)] transition-colors">
            <span>Görev paneline git</span>
            <ChevronRight className="w-3 h-3" />
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab('focus')}
          className="metric-box p-4 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--muted)]">Toplam Odak Süresi</span>
            <div className="w-7 h-7 rounded-full bg-[var(--surface)] border border-[var(--border)] text-indigo-400 flex items-center justify-center">
              <Timer className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[var(--txt)] tracking-tight font-mono mt-2">
            {Math.floor(userProfile.totalFocusMinutes / 60)}s {userProfile.totalFocusMinutes % 60}d
          </p>
          <p className="text-[10px] text-[var(--muted)] mt-1 flex items-center gap-1 group-hover:text-[var(--txt)] transition-colors">
            <span>Pomodoro başlat</span>
            <ChevronRight className="w-3 h-3" />
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab('progress')}
          className="metric-box p-4 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--muted)]">Son TYT Neti</span>
            <div className="w-7 h-7 rounded-full bg-[var(--surface)] border border-[var(--border)] text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[var(--txt)] tracking-tight font-mono mt-2">
            {latestDeneme ? `${latestDeneme.totalNet} Net` : 'Kayıt yok'}
          </p>
          <p className="text-[10px] text-[var(--muted)] mt-1 flex items-center gap-1 group-hover:text-[var(--txt)] transition-colors">
            <span>Deneme grafiğine bak</span>
            <ChevronRight className="w-3 h-3" />
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab('progress')}
          className="metric-box p-4 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--muted)]">Hedef Derece</span>
            <div className="w-7 h-7 rounded-full bg-[var(--surface)] border border-[var(--border)] text-indigo-400 flex items-center justify-center">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[var(--txt)] tracking-tight mt-2">
            {userProfile.targetExamRank}
          </p>
          <p className="text-[10px] text-[var(--muted)] mt-1 flex items-center gap-1 group-hover:text-[var(--txt)] transition-colors">
            <span>İlerleme analizi</span>
            <ChevronRight className="w-3 h-3" />
          </p>
        </div>
      </div>
    </div>
  );
};
