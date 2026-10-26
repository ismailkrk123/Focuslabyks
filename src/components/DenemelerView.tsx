import React, { useState } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Trash2, 
  Calculator, 
  Award
} from 'lucide-react';
import { DenemeRecord, SubjectResult } from '../types';

interface DenemelerViewProps {
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

export const DenemelerView: React.FC<DenemelerViewProps> = ({ denemeler, setDenemeler }) => {
  const [activeTab, setActiveTab] = useState<'TYT' | 'AYT'>('TYT');
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [examTitle, setExamTitle] = useState<string>('');
  const [examDate, setExamDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [examNotes, setExamNotes] = useState<string>('');

  const defaultSubjects = activeTab === 'TYT' ? TYT_DEFAULT_SUBJECTS : AYT_DEFAULT_SUBJECTS;
  const [subjectInputs, setSubjectInputs] = useState<Record<string, { correct: number; wrong: number }>>(() => {
    const init: Record<string, { correct: number; wrong: number }> = {};
    defaultSubjects.forEach(s => {
      init[s.name] = { correct: 0, wrong: 0 };
    });
    return init;
  });

  const filteredExams = denemeler.filter(d => d.type === activeTab);
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
      type: activeTab,
      date: examDate,
      totalQuestions: totalQ,
      totalNet: calculateTotalNetForInputs(),
      subjects: subjectsResult,
      notes: examNotes
    };

    setDenemeler(prev => [...prev, newRecord]);
    setIsNewModalOpen(false);
    setExamTitle('');
    setExamNotes('');
  };

  const handleDeleteExam = (id: string) => {
    setDenemeler(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="panel p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/[0.06] text-[#4de1d2] flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-[#f2f4fa] tracking-tight">
              YKS deneme ve net takipçisi
            </h2>
          </div>
          <p className="text-xs text-[var(--muted)] font-light mt-1">
            ÖSYM standartlarında konu soru dağılımı, net hesaplama ve gelişim grafikleri.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* TYT / AYT Selector */}
          <div className="p-1 rounded-full bg-black/50 border border-white/10 flex items-center">
            <button
              onClick={() => setActiveTab('TYT')}
              className={`py-1.5 px-4 rounded-full text-xs font-medium transition-all ${
                activeTab === 'TYT'
                  ? 'bg-white/[0.16] text-[#4de1d2] font-extrabold shadow-sm'
                  : 'text-[var(--muted)] hover:text-white'
              }`}
            >
              TYT (120 Soru)
            </button>
            <button
              onClick={() => setActiveTab('AYT')}
              className={`py-1.5 px-4 rounded-full text-xs font-medium transition-all ${
                activeTab === 'AYT'
                  ? 'bg-white/[0.16] text-[#4de1d2] font-extrabold shadow-sm'
                  : 'text-[var(--muted)] hover:text-white'
              }`}
            >
              AYT alan denemeleri
            </button>
          </div>

          <button
            onClick={() => {
              const init: Record<string, { correct: number; wrong: number }> = {};
              (activeTab === 'TYT' ? TYT_DEFAULT_SUBJECTS : AYT_DEFAULT_SUBJECTS).forEach(s => {
                init[s.name] = { correct: 0, wrong: 0 };
              });
              setSubjectInputs(init);
              setIsNewModalOpen(true);
            }}
            className="btn-accent py-2 px-4 text-xs font-extrabold flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni deneme ekle</span>
          </button>
        </div>
      </div>

      {/* Net Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="glass-cell p-5">
          <p className="text-xs font-medium text-[var(--muted)]">En yüksek net</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-[#4de1d2] font-mono">{highestNet}</span>
            <span className="text-xs text-[var(--muted)]">net</span>
          </div>
          <p className="text-[11px] text-[#4de1d2] mt-1 flex items-center gap-1 font-light">
            <Award className="w-3.5 h-3.5" />
            <span>Zirve performans</span>
          </p>
        </div>

        <div className="glass-cell p-5">
          <p className="text-xs font-medium text-[var(--muted)]">Ortalama net</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-[#f2f4fa] font-mono">{averageNet}</span>
            <span className="text-xs text-[var(--muted)]">net</span>
          </div>
          <p className="text-[11px] text-[var(--muted)] mt-1 font-light">
            Toplam {filteredExams.length} deneme kaydı
          </p>
        </div>

        <div className="glass-cell p-5">
          <p className="text-xs font-medium text-[var(--muted)]">Son deneme neti</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-[#f2f4fa] font-mono">{latestNet}</span>
            <span className="text-xs text-[var(--muted)]">net</span>
          </div>
          <p className="text-[11px] text-[#4de1d2] mt-1 flex items-center gap-1 font-light">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Hedefe doğru ilerleyiş</span>
          </p>
        </div>
      </div>

      {/* Visual Net Progression Growth Graph */}
      <div className="panel p-6 sm:p-7 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-[#f2f4fa] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#4de1d2]" />
            <span>{activeTab} net gelişim grafiği</span>
          </h3>
          <span className="text-xs text-[var(--muted)] font-mono">Net = D - (Y / 4)</span>
        </div>

        {filteredExams.length > 0 ? (
          <div className="h-52 w-full flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-4 border-b border-white/10">
            {filteredExams.map((exam) => {
              const maxScale = activeTab === 'TYT' ? 120 : 80;
              const heightPercent = Math.min(100, Math.max(15, (exam.totalNet / maxScale) * 100));

              return (
                <div key={exam.id} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 border border-white/20 rounded-full px-2.5 py-1 text-[11px] text-white pointer-events-none whitespace-nowrap z-20 font-mono">
                    <p className="font-bold text-[#4de1d2]">{exam.totalNet} Net</p>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#f2f4fa] mb-1.5 group-hover:text-[#4de1d2] transition-colors">
                    {exam.totalNet}
                  </span>

                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[40px] rounded-t-[14px] bg-[#4de1d2]/40 border-t border-x border-[#4de1d2]/60 group-hover:bg-[#4de1d2]/70 transition-all shadow-lg"
                  />

                  <span className="text-[11px] text-[var(--muted)] truncate max-w-[80px] mt-2 group-hover:text-white font-light">
                    {exam.title}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-[var(--muted)] font-light text-xs">
            Henüz {activeTab} deneme kaydı yok. "Yeni deneme ekle" butonuna dokunarak başlayın.
          </div>
        )}
      </div>

      {/* Past Exams Detailed List */}
      <div className="panel p-6 sm:p-7 shadow-2xl">
        <h3 className="text-base font-extrabold text-[#f2f4fa] mb-4">Geçmiş {activeTab} denemeleri</h3>
        <div className="space-y-3">
          {filteredExams.map(exam => (
            <div
              key={exam.id}
              className="p-4 rounded-[22px] glass-cell hover:bg-white/[0.08] transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div>
                  <h4 className="text-sm font-bold text-[#f2f4fa]">{exam.title}</h4>
                  <p className="text-xs text-[var(--muted)] font-light">{exam.date} {exam.notes ? `• ${exam.notes}` : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-[var(--muted)]">Net:</span>
                    <span className="text-xl font-extrabold text-[#4de1d2] font-mono ml-1.5">{exam.totalNet}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteExam(exam.id)}
                    className="text-[var(--muted)] hover:text-rose-400 p-1.5 rounded-full hover:bg-white/5 transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subject Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                {exam.subjects.map(s => (
                  <div key={s.name} className="p-2.5 rounded-[16px] bg-black/40 border border-white/5">
                    <div className="flex justify-between text-xs font-medium text-[var(--txt)] mb-1">
                      <span className="truncate">{s.name}</span>
                      <span className="text-[#4de1d2] font-mono font-bold">{s.net} N</span>
                    </div>
                    <div className="text-[10px] text-[var(--muted)] font-mono flex justify-between">
                      <span className="text-[#4de1d2]">{s.correct}D</span>
                      <span className="text-rose-400">{s.wrong}Y</span>
                      <span className="text-[var(--muted)]">{s.empty}B</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Exam Input Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="panel w-full max-w-xl p-6 relative overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-extrabold text-[#f2f4fa] flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#4de1d2]" />
                <span>Yeni {activeTab} deneme girişi</span>
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-[var(--muted)] hover:text-white p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1">Deneme adı / Yayın</label>
                  <input
                    type="text"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    placeholder="Örn: Türkiye geneli deneme 1"
                    className="w-full glass-input px-3.5 py-2 text-xs text-[#f2f4fa]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] block mb-1">Tarih</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full glass-input px-3.5 py-2 text-xs font-mono text-[#f2f4fa]"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-[var(--muted)] mb-2">Ders ders doğru ve yanlış sayıları</p>
                <div className="space-y-2">
                  {defaultSubjects.map(sub => {
                    const inp = subjectInputs[sub.name] || { correct: 0, wrong: 0 };
                    const empty = Math.max(0, sub.maxQuestions - (inp.correct + inp.wrong));
                    const currentNet = Math.max(0, Number((inp.correct - (inp.wrong / 4)).toFixed(2)));

                    return (
                      <div
                        key={sub.name}
                        className="p-3 rounded-[18px] glass-cell flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-[130px]">
                          <p className="font-bold text-[#f2f4fa]">{sub.name}</p>
                          <p className="text-[10px] text-[var(--muted)] font-light">{sub.maxQuestions} soru kapasitesi</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#4de1d2] font-bold">D:</span>
                            <input
                              type="number"
                              min="0"
                              max={sub.maxQuestions}
                              value={inp.correct}
                              onChange={(e) => handleInputChange(sub.name, 'correct', Number(e.target.value), sub.maxQuestions)}
                              className="w-12 bg-black/60 border border-white/20 rounded-full px-2 py-1 text-[#f2f4fa] font-mono text-center outline-none focus:outline-white"
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-rose-400 font-bold">Y:</span>
                            <input
                              type="number"
                              min="0"
                              max={sub.maxQuestions}
                              value={inp.wrong}
                              onChange={(e) => handleInputChange(sub.name, 'wrong', Number(e.target.value), sub.maxQuestions)}
                              className="w-12 bg-black/60 border border-white/20 rounded-full px-2 py-1 text-[#f2f4fa] font-mono text-center outline-none focus:outline-white"
                            />
                          </div>

                          <div className="text-[11px] text-[var(--muted)] min-w-[32px] font-mono">
                            {empty}B
                          </div>

                          <div className="px-2.5 py-1 rounded-full bg-white/[0.08] text-[#4de1d2] font-mono font-bold min-w-[50px] text-center">
                            {currentNet}N
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--muted)] block mb-1">Notlar</label>
                <input
                  type="text"
                  value={examNotes}
                  onChange={(e) => setExamNotes(e.target.value)}
                  placeholder="Eksikleriniz, süre değerlendirmeniz..."
                  className="w-full glass-input px-3.5 py-2 text-xs text-[#f2f4fa]"
                />
              </div>

              <div className="p-3.5 rounded-[20px] glass-cell flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--txt)]">Hesaplanan toplam net:</span>
                <span className="text-2xl font-extrabold text-[#4de1d2] font-mono">
                  {calculateTotalNetForInputs()} Net
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="py-1.5 px-4 rounded-full text-xs text-[var(--muted)] hover:text-white"
              >
                İptal
              </button>
              <button
                onClick={handleSaveExam}
                disabled={!examTitle.trim()}
                className="btn-accent py-2 px-6 text-xs font-extrabold disabled:opacity-40"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
