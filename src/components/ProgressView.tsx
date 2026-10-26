import React, { useState } from 'react';
import { 
  TrendingUp, 
  BarChart2, 
  PieChart, 
  CheckCircle2, 
  Calculator, 
  Plus, 
  Trash2, 
  Layers
} from 'lucide-react';
import { TaskCard, UserProfile, DenemeRecord, SubjectResult } from '../types';

interface ProgressViewProps {
  tasks: TaskCard[];
  userProfile: UserProfile;
  denemeler: DenemeRecord[];
  setDenemeler: React.Dispatch<React.SetStateAction<DenemeRecord[]>>;
}

const TYT_DEFAULT_SUBJECTS: { name: string; maxQuestions: number }[] = [
  { name: 'Türkçe', maxQuestions: 40 },
  { name: 'Sosyal Bilimler', maxQuestions: 20 },
  { name: 'Temel Matematik', maxQuestions: 40 },
  { name: 'Fen Bilimleri', maxQuestions: 20 },
];

const AYT_DEFAULT_SUBJECTS: { name: string; maxQuestions: number }[] = [
  { name: 'Matematik & Geometri', maxQuestions: 40 },
  { name: 'Fizik', maxQuestions: 14 },
  { name: 'Kimya', maxQuestions: 13 },
  { name: 'Biyoloji', maxQuestions: 13 },
  { name: 'Türk Dili ve Edebiyatı', maxQuestions: 24 },
  { name: 'Tarih-1', maxQuestions: 10 },
  { name: 'Coğrafya-1', maxQuestions: 6 },
];

export const ProgressView: React.FC<ProgressViewProps> = ({ 
  tasks, 
  userProfile,
  denemeler,
  setDenemeler
}) => {
  const [viewSubTab, setViewSubTab] = useState<'general' | 'denemeler'>('general');
  const [activeExamType, setActiveExamType] = useState<'TYT' | 'AYT'>('TYT');
  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState<boolean>(false);
  const [examTitle, setExamTitle] = useState<string>('');
  const [examDate, setExamDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [examNotes, setExamNotes] = useState<string>('');

  const defaultSubjects = activeExamType === 'TYT' ? TYT_DEFAULT_SUBJECTS : AYT_DEFAULT_SUBJECTS;
  const [subjectInputs, setSubjectInputs] = useState<Record<string, { correct: number; wrong: number }>>(() => {
    const init: Record<string, { correct: number; wrong: number }> = {};
    defaultSubjects.forEach(s => {
      init[s.name] = { correct: 0, wrong: 0 };
    });
    return init;
  });

  const weeklyData = [
    { day: 'Pzt', minutes: 160, label: '2s 40d' },
    { day: 'Sal', minutes: 210, label: '3s 30d' },
    { day: 'Çar', minutes: 180, label: '3s 00d' },
    { day: 'Per', minutes: 240, label: '4s 00d' },
    { day: 'Cum', minutes: 195, label: '3s 15d' },
    { day: 'Cmt', minutes: 310, label: '5s 10d' },
    { day: 'Paz', minutes: 145, label: '2s 25d' },
  ];

  const maxMinutes = Math.max(...weeklyData.map(d => d.minutes));

  const categoryStats = [
    { name: 'Matematik & Geometri', percent: 40, color: '#6366f1', minutes: 280 },
    { name: 'Türkçe & Paragraf', percent: 25, color: '#94a3b8', minutes: 175 },
    { name: 'Fen Bilimleri', percent: 20, color: '#818cf8', minutes: 140 },
    { name: 'Sosyal Bilimler', percent: 15, color: '#cbd5e1', minutes: 105 },
  ];

  const totalWeeklyMinutes = weeklyData.reduce((acc, d) => acc + d.minutes, 0);
  const totalHours = Math.floor(totalWeeklyMinutes / 60);
  const remMinutes = totalWeeklyMinutes % 60;

  const filteredExams = denemeler.filter(d => d.type === activeExamType);
  const totalNets = filteredExams.map(e => e.totalNet);
  const highestNet = totalNets.length > 0 ? Math.max(...totalNets) : 0;
  const averageNet = totalNets.length > 0 ? (totalNets.reduce((a, b) => a + b, 0) / totalNets.length).toFixed(2) : '0';
  const latestNet = totalNets.length > 0 ? totalNets[totalNets.length - 1] : 0;

  const handleInputChange = (subName: string, field: 'correct' | 'wrong', value: number, maxQ: number) => {
    const val = Math.max(0, Math.min(maxQ, value));
    setSubjectInputs(prev => {
      const current = prev[subName] || { correct: 0, wrong: 0 };
      const updated = { ...current, [field]: val };
      if (updated.correct + updated.wrong > maxQ) {
        if (field === 'correct') {
          updated.wrong = maxQ - updated.correct;
        } else {
          updated.correct = maxQ - updated.wrong;
        }
      }
      return { ...prev, [subName]: updated };
    });
  };

  const calculateTotalNetForInputs = () => {
    let sum = 0;
    defaultSubjects.forEach(s => {
      const inp = subjectInputs[s.name] || { correct: 0, wrong: 0 };
      const net = Math.max(0, inp.correct - (inp.wrong / 4));
      sum += net;
    });
    return Number(sum.toFixed(2));
  };

  const handleSaveExam = () => {
    if (!examTitle.trim()) return;

    let totalQ = 0;
    const subjectsResult: SubjectResult[] = defaultSubjects.map(s => {
      const inp = subjectInputs[s.name] || { correct: 0, wrong: 0 };
      const empty = Math.max(0, s.maxQuestions - (inp.correct + inp.wrong));
      const net = Math.max(0, Number((inp.correct - (inp.wrong / 4)).toFixed(2)));
      totalQ += s.maxQuestions;
      return {
        name: s.name,
        maxQuestions: s.maxQuestions,
        correct: inp.correct,
        wrong: inp.wrong,
        empty: empty,
        net: net
      };
    });

    const newRecord: DenemeRecord = {
      id: 'deneme-' + Date.now(),
      title: examTitle.trim(),
      type: activeExamType,
      date: examDate,
      totalQuestions: totalQ,
      totalNet: calculateTotalNetForInputs(),
      subjects: subjectsResult,
      notes: examNotes
    };

    setDenemeler(prev => [...prev, newRecord]);
    setIsNewExamModalOpen(false);
    setExamTitle('');
    setExamNotes('');
  };

  const handleDeleteExam = (id: string) => {
    setDenemeler(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5 select-none px-2 sm:px-4">
      {/* Top Banner with SubTab Switcher */}
      <div className="panel p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-indigo-400">
            {viewSubTab === 'general' ? <TrendingUp className="w-4 h-4" /> : <Calculator className="w-4 h-4" />}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[var(--txt)] tracking-tight">
              {viewSubTab === 'general' ? 'Haftalık İlerleme & Odak Analitiği' : 'YKS Deneme & Net Takipçisi'}
            </h2>
            <p className="text-xs text-[var(--muted)] font-light mt-0.5">
              {viewSubTab === 'general' 
                ? 'Çalışma süreleri, konu dağılımları ve verimlilik metrikleri.' 
                : 'ÖSYM standartlarında net hesabı, TYT/AYT gelişim grafikleri ve konu analizleri.'}
            </p>
          </div>
        </div>

        {/* View Switcher Capsule */}
        <div className="flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] p-1">
          <button
            onClick={() => setViewSubTab('general')}
            className={`py-1.5 px-4 rounded-full text-xs font-medium transition-all ${
              viewSubTab === 'general'
                ? 'bg-white/10 text-[var(--txt)] font-extrabold'
                : 'text-[var(--muted)] hover:text-[var(--txt)]'
            }`}
          >
            Genel İlerleme
          </button>
          <button
            onClick={() => setViewSubTab('denemeler')}
            className={`py-1.5 px-4 rounded-full text-xs font-medium transition-all ${
              viewSubTab === 'denemeler'
                ? 'bg-white/10 text-[var(--txt)] font-extrabold'
                : 'text-[var(--muted)] hover:text-[var(--txt)]'
            }`}
          >
            YKS Denemelerim
          </button>
        </div>
      </div>

      {/* SECTION 1: GENERAL FOCUS PROGRESS */}
      {viewSubTab === 'general' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Quick Metrics: CRISP rounded-xl as requested (not hyper-bloated pills) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="metric-box p-4 rounded-xl">
              <span className="text-[10px] text-[var(--muted)] block">Haftalık Odak</span>
              <span className="text-lg font-extrabold text-[var(--txt)] font-mono">{totalHours}s {remMinutes}d</span>
            </div>
            <div className="metric-box p-4 rounded-xl">
              <span className="text-[10px] text-[var(--muted)] block">Hedef Derece</span>
              <span className="text-lg font-extrabold text-[var(--txt)]">{userProfile.targetExamRank}</span>
            </div>
            <div className="metric-box p-4 rounded-xl">
              <span className="text-[10px] text-[var(--muted)] block">Alanın</span>
              <span className="text-lg font-extrabold text-[var(--txt)]">{userProfile.yksField}</span>
            </div>
            <div className="metric-box p-4 rounded-xl">
              <span className="text-[10px] text-[var(--muted)] block">Tamamlanan Görev</span>
              <span className="text-lg font-extrabold text-[var(--txt)]">{tasks.filter(t => t.completed).length} Adet</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* 7-Day Focus Bar Chart */}
            <div className="lg:col-span-7 panel p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-[var(--txt)] flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-indigo-400" />
                    <span>Gün Gün Odak Süresi</span>
                  </h3>
                  <span className="text-xs text-[var(--muted)]">Hedef: 4s / Gün</span>
                </div>
              </div>

              <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 pt-4 pb-2 px-2 border-b border-[var(--border)]">
                {weeklyData.map((d, i) => {
                  const heightPercent = Math.max(15, (d.minutes / maxMinutes) * 100);
                  const isToday = i === weeklyData.length - 1;

                  return (
                    <div key={d.day} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      <span className="text-[10px] font-mono text-[var(--muted)] mb-1">
                        {Math.round(d.minutes / 60)}s
                      </span>

                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[26px] rounded-t-md transition-all ${
                          isToday
                            ? 'bg-indigo-500'
                            : 'bg-white/15 hover:bg-white/30'
                        }`}
                      />

                      <span className={`text-[10px] mt-2 truncate ${isToday ? 'font-bold text-[var(--txt)]' : 'text-[var(--muted)]'}`}>
                        {d.day}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted)] pt-1 font-light">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Bugün</span>
                </span>
                <span className="font-mono">Ortalama: 3s 20d / gün</span>
              </div>
            </div>

            {/* Category Donut */}
            <div className="lg:col-span-5 panel p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--txt)] flex items-center gap-2 mb-4">
                  <PieChart className="w-4 h-4 text-indigo-400" />
                  <span>Ders Dağılımı</span>
                </h3>

                <div className="flex items-center justify-center my-2">
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50" cy="50" r="38"
                        className="fill-none stroke-indigo-500"
                        strokeWidth="10"
                        strokeDasharray={`${(40 * 2.38)} ${(100 - 40) * 2.38}`}
                        strokeDashoffset="0"
                      />
                      <circle
                        cx="50" cy="50" r="38"
                        className="fill-none stroke-slate-400"
                        strokeWidth="10"
                        strokeDasharray={`${(25 * 2.38)} ${(100 - 25) * 2.38}`}
                        strokeDashoffset={`-${40 * 2.38}`}
                      />
                      <circle
                        cx="50" cy="50" r="38"
                        className="fill-none stroke-indigo-300"
                        strokeWidth="10"
                        strokeDasharray={`${(20 * 2.38)} ${(100 - 20) * 2.38}`}
                        strokeDashoffset={`-${(40 + 25) * 2.38}`}
                      />
                      <circle
                        cx="50" cy="50" r="38"
                        className="fill-none stroke-slate-600"
                        strokeWidth="10"
                        strokeDasharray={`${(15 * 2.38)} ${(100 - 15) * 2.38}`}
                        strokeDashoffset={`-${(40 + 25 + 20) * 2.38}`}
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-lg font-extrabold text-[var(--txt)] font-mono">{totalHours}s</span>
                      <span className="text-[9px] text-[var(--muted)] uppercase">Toplam</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 mt-2">
                {categoryStats.map(cat => (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-[var(--muted)] truncate max-w-[170px]">{cat.name}</span>
                    </div>
                    <span className="font-bold text-[var(--txt)] font-mono">%{cat.percent}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Completed Goals */}
          <div className="panel p-5 sm:p-6">
            <h3 className="text-sm font-extrabold text-[var(--txt)] mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Tamamlanan Son Hedefler</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {tasks.filter(t => t.completed).slice(0, 6).map(t => (
                <div key={t.id} className="p-3 rounded-xl metric-box flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[var(--txt)] truncate">{t.title}</p>
                    <p className="text-[10px] text-[var(--muted)]">{t.durationMinutes} dk • {t.date}</p>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.completed).length === 0 && (
                <p className="text-xs text-[var(--muted)] font-light italic col-span-3">Henüz tamamlanan hedef yok.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: YKS DENEMELERI & NET TAKIBI */}
      {viewSubTab === 'denemeler' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Controls: TYT / AYT Selector & New Exam Button */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] p-1 flex items-center">
              <button
                onClick={() => setActiveExamType('TYT')}
                className={`py-1.5 px-4 rounded-full text-xs font-medium transition-all ${
                  activeExamType === 'TYT'
                    ? 'bg-white/10 text-[var(--txt)] font-extrabold'
                    : 'text-[var(--muted)] hover:text-[var(--txt)]'
                }`}
              >
                TYT (120 Soru)
              </button>
              <button
                onClick={() => setActiveExamType('AYT')}
                className={`py-1.5 px-4 rounded-full text-xs font-medium transition-all ${
                  activeExamType === 'AYT'
                    ? 'bg-white/10 text-[var(--txt)] font-extrabold'
                    : 'text-[var(--muted)] hover:text-[var(--txt)]'
                }`}
              >
                AYT Alan Denemeleri
              </button>
            </div>

            <button
              onClick={() => setIsNewExamModalOpen(true)}
              className="btn-accent py-2 px-5 text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Deneme Ekle</span>
            </button>
          </div>

          {/* Net Metrics: Crisp rounded-xl */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="metric-box p-4 rounded-xl">
              <span className="text-[11px] text-[var(--muted)] block">Son {activeExamType} Neti</span>
              <span className="text-2xl font-extrabold text-[var(--txt)] font-mono">{latestNet.toFixed(2)}</span>
            </div>
            <div className="metric-box p-4 rounded-xl">
              <span className="text-[11px] text-[var(--muted)] block">Ortalama Net</span>
              <span className="text-2xl font-extrabold text-[var(--txt)] font-mono">{averageNet}</span>
            </div>
            <div className="metric-box p-4 rounded-xl">
              <span className="text-[11px] text-[var(--muted)] block">Zirve Net</span>
              <span className="text-2xl font-extrabold text-indigo-400 font-mono">{highestNet.toFixed(2)}</span>
            </div>
          </div>

          {/* Exam History List */}
          <div className="panel p-5 sm:p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-[var(--txt)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Kayıtlı {activeExamType} Denemeleri ({filteredExams.length})</span>
            </h3>

            <div className="space-y-3">
              {filteredExams.map(exam => (
                <div key={exam.id} className="p-4 rounded-xl metric-box space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-[var(--surface)] text-indigo-400 border border-[var(--border)]">
                          {exam.type}
                        </span>
                        <h4 className="text-sm font-extrabold text-[var(--txt)]">{exam.title}</h4>
                      </div>
                      <span className="text-[11px] text-[var(--muted)] font-mono">{exam.date}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-[var(--muted)] block">Toplam Net</span>
                        <span className="text-lg font-extrabold text-indigo-400 font-mono">
                          {exam.totalNet.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
                        className="p-1.5 text-[var(--muted)] hover:text-rose-400 rounded-md border border-[var(--border)]"
                        title="Denemeyi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Subject Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {exam.subjects.map(sub => (
                      <div key={sub.name} className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs">
                        <span className="text-[11px] font-medium text-[var(--txt)] block truncate">{sub.name}</span>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-[var(--muted)] font-mono">
                          <span>{sub.correct}D {sub.wrong}Y</span>
                          <span className="font-bold text-[var(--txt)]">{sub.net} Net</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {exam.notes && (
                    <p className="text-xs text-[var(--muted)] italic pt-1 border-t border-[var(--border)]">
                      Not: {exam.notes}
                    </p>
                  )}
                </div>
              ))}

              {filteredExams.length === 0 && (
                <div className="py-12 text-center text-[var(--muted)]">
                  <p className="text-xs font-light">Henüz kayıtlı {activeExamType} denemesi bulunmuyor.</p>
                  <button
                    onClick={() => setIsNewExamModalOpen(true)}
                    className="mt-2 text-xs text-indigo-400 hover:underline font-medium"
                  >
                    + İlk denemenin sonuçlarını kaydet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Deneme Modal */}
      {isNewExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="panel w-full max-w-xl p-6 rounded-3xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-sm font-extrabold text-[var(--txt)]">
                Yeni {activeExamType} Denemesi Kaydet
              </h3>
              <button
                onClick={() => setIsNewExamModalOpen(false)}
                className="text-[var(--muted)] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1">Deneme Adı / Yayın</label>
                  <input
                    type="text"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    placeholder="Örn: 3D Türkiye Geneli TYT - 1"
                    className="w-full clean-input px-3.5 py-2 text-xs text-[var(--txt)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1">Tarih</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full clean-input px-3.5 py-2 text-xs text-[var(--txt)]"
                  />
                </div>
              </div>

              {/* Subject correct/wrong inputs */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--muted)] block">Ders Doğru / Yanlış Sayıları</label>
                <div className="space-y-2">
                  {defaultSubjects.map(sub => {
                    const currentInp = subjectInputs[sub.name] || { correct: 0, wrong: 0 };
                    const currentNet = Math.max(0, currentInp.correct - (currentInp.wrong / 4)).toFixed(2);

                    return (
                      <div key={sub.name} className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-between gap-3 text-xs">
                        <span className="w-36 font-medium text-[var(--txt)] truncate">{sub.name} ({sub.maxQuestions}S)</span>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-[var(--muted)]">D:</span>
                            <input
                              type="number"
                              min="0"
                              max={sub.maxQuestions}
                              value={currentInp.correct}
                              onChange={(e) => handleInputChange(sub.name, 'correct', Number(e.target.value), sub.maxQuestions)}
                              className="w-12 rounded px-2 py-1 text-center font-mono text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--txt)]"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-[var(--muted)]">Y:</span>
                            <input
                              type="number"
                              min="0"
                              max={sub.maxQuestions}
                              value={currentInp.wrong}
                              onChange={(e) => handleInputChange(sub.name, 'wrong', Number(e.target.value), sub.maxQuestions)}
                              className="w-12 rounded px-2 py-1 text-center font-mono text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--txt)]"
                            />
                          </div>

                          <div className="w-16 text-right font-mono font-bold text-indigo-400 text-xs">
                            {currentNet} Net
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1">Deneme Notu / Analiz</label>
                <textarea
                  value={examNotes}
                  onChange={(e) => setExamNotes(e.target.value)}
                  placeholder="Notlarınız..."
                  rows={2}
                  className="w-full rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] p-3 text-xs text-[var(--txt)] outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--muted)]">
                Net: <strong className="text-indigo-400 text-sm">{calculateTotalNetForInputs()}</strong>
              </span>
              <button
                onClick={handleSaveExam}
                disabled={!examTitle.trim()}
                className="btn-accent px-5 py-2 text-xs font-bold disabled:opacity-40"
              >
                Denemeyi Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
