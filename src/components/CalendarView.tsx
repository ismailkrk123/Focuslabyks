import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus,
  X,
  Check
} from 'lucide-react';
import { TaskCard } from '../types';

interface CalendarViewProps {
  tasks: TaskCard[];
  onAddTaskForDate: (date: string, hour?: string) => void;
  onToggleTaskComplete?: (taskId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ 
  tasks, 
  onAddTaskForDate,
  onToggleTaskComplete 
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [expandedDayStr, setExpandedDayStr] = useState<string | null>(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'1' | '2'>('1');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const daysOfWeek = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const hoursOfDay = Array.from({ length: 18 }, (_, i) => {
    const h = i + 6;
    return `${h < 10 ? '0' : ''}${h}:00`;
  });

  return (
    <div className="space-y-5 max-w-5xl mx-auto select-none px-2 sm:px-4">
      {/* Calendar Top Navigation Header */}
      <div className="panel p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-indigo-400">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[var(--txt)]">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-[var(--muted)] font-light mt-0.5">
              Güne tıkladığınızda hücre ağır çekimde kare olarak büyür, diğer günler küçülür.
            </p>
          </div>
        </div>

        {/* Prev / Next Month Capsule */}
        <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-1.5">
          <button
            onClick={handlePrevMonth}
            className="p-1 text-[var(--muted)] hover:text-[var(--txt)] rounded-full transition-colors"
            title="Önceki Ay"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold px-2 text-[var(--txt)]">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 text-[var(--muted)] hover:text-[var(--txt)] rounded-full transition-colors"
            title="Sonraki Ay"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Calendar Body */}
      <div className="panel p-4 sm:p-6 relative overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center mb-2.5 text-xs font-medium text-[var(--muted)]">
          {daysOfWeek.map(d => (
            <span key={d} className="py-1">
              {d}
            </span>
          ))}
        </div>

        {/* Days Grid - Uniform 7 Columns */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Previous month empty days */}
          {Array.from({ length: startingDayIndex }).map((_, i) => (
            <div 
              key={'prev-' + i} 
              className="h-14 sm:h-16 rounded-xl bg-white/[0.01] border border-transparent p-2 text-white/10 text-xs flex flex-col justify-between opacity-30 pointer-events-none"
            >
              <span>{prevMonthDays - startingDayIndex + i + 1}</span>
            </div>
          ))}

          {/* Current Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const formattedDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isExpanded = expandedDayStr === formattedDateStr;
            const dayTasks = tasks.filter(t => t.date === formattedDateStr);
            const isCompletedDay = dayTasks.length > 0 && dayTasks.every(t => t.completed);

            if (isExpanded) {
              /* INLINE EXPANDED COMPACT HARMONIC DAY CELL (Önceki gibi doğrudan hücre büyür, ölçülü boyutta, ekstra panel yok) */
              return (
                <div
                  key={formattedDateStr}
                  className="col-span-7 flex justify-center my-2.5 calendar-expanded-slow"
                >
                  <div className="w-full max-w-md sm:max-w-lg h-64 sm:h-72 rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-[var(--border)] bg-[var(--surface-elevated)] shadow-xl overflow-hidden transition-all duration-500 ease-out">
                    {/* Header inside the expanded cell */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border)] shrink-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center font-extrabold text-sm text-indigo-400">
                          {dayNum}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-xs sm:text-sm font-extrabold text-[var(--txt)]">
                              {dayNum} {monthNames[month]} {year}
                            </h3>
                            {isCompletedDay && (
                              <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded-full font-medium">
                                Tamamlandı
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[var(--muted)] font-light">
                            {dayTasks.length} adet kayıtlı etkinlik & plan
                          </p>
                        </div>
                      </div>

                      {/* Mode Switcher + Add + Close */}
                      <div className="flex items-center gap-1">
                        <div className="flex items-center bg-[var(--surface)] border border-[var(--border)] p-0.5 rounded-full text-[11px]">
                          <button
                            onClick={() => setViewMode('1')}
                            className={`py-0.5 px-2 rounded-full font-medium transition-all ${
                              viewMode === '1'
                                ? 'bg-white/10 text-[var(--txt)] font-bold'
                                : 'text-[var(--muted)] hover:text-[var(--txt)]'
                            }`}
                          >
                            Önizle
                          </button>
                          <button
                            onClick={() => setViewMode('2')}
                            className={`py-0.5 px-2 rounded-full font-medium transition-all ${
                              viewMode === '2'
                                ? 'bg-white/10 text-[var(--txt)] font-bold'
                                : 'text-[var(--muted)] hover:text-[var(--txt)]'
                            }`}
                          >
                            Saatlik
                          </button>
                        </div>

                        <button
                          onClick={() => onAddTaskForDate(formattedDateStr)}
                          className="btn-accent p-1.5 rounded-full"
                          title="Bu güne hedef ekle"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => setExpandedDayStr(null)}
                          className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--txt)] border border-[var(--border)]"
                          title="Küçült"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Scrollable Body inside cell */}
                    <div className="flex-1 overflow-y-auto py-2.5 pr-1 my-1">
                      {/* MODE 1: Görev Önizlemesi */}
                      {viewMode === '1' && (
                        <div className="space-y-1.5">
                          {dayTasks.map(task => (
                            <div
                              key={task.id}
                              className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between gap-2 hover:border-[var(--border-hover)] transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <button
                                  onClick={() => onToggleTaskComplete && onToggleTaskComplete(task.id)}
                                  className={`w-3.5 h-3.5 rounded-md flex items-center justify-center transition-all ${
                                    task.completed
                                      ? 'bg-indigo-600 text-white'
                                      : 'border border-[var(--border-hover)] text-transparent'
                                  }`}
                                >
                                  <Check className="w-2 h-2" />
                                </button>
                                <div className="min-w-0">
                                  <p className={`text-xs font-medium truncate ${task.completed ? 'line-through text-[var(--muted)]' : 'text-[var(--txt)]'}`}>
                                    {task.title}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-[9px] text-[var(--muted)] mt-0.5 font-light">
                                    {task.scheduledTime && (
                                      <span className="font-mono text-indigo-400">{task.scheduledTime}</span>
                                    )}
                                    <span>• {task.durationMinutes} dk</span>
                                  </div>
                                </div>
                              </div>
                              <span className="text-[9px] text-[var(--muted)] bg-black/20 px-1.5 py-0.5 rounded-md uppercase shrink-0">
                                {task.category === 'task' ? 'Görev' : task.category === 'event' ? 'Etkinlik' : 'To-Do'}
                              </span>
                            </div>
                          ))}

                          {dayTasks.length === 0 && (
                            <div className="py-8 text-center text-[var(--muted)]">
                              <p className="text-xs font-light">Bu gün için henüz kayıtlı bir hedef yok.</p>
                              <button
                                onClick={() => onAddTaskForDate(formattedDateStr)}
                                className="mt-1.5 text-xs text-indigo-400 hover:underline font-medium"
                              >
                                + Hedef ekle
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* MODE 2: Saatlik Çizelge */}
                      {viewMode === '2' && (
                        <div className="space-y-1">
                          {hoursOfDay.map(hour => {
                            const matchingTasks = dayTasks.filter(t => {
                              if (!t.scheduledTime) return false;
                              const taskH = t.scheduledTime.split(':')[0];
                              const hourH = hour.split(':')[0];
                              return taskH === hourH;
                            });

                            return (
                              <div 
                                key={hour} 
                                className="flex items-center gap-2 py-1 px-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[11px]"
                              >
                                <span className="w-10 text-[10px] font-mono font-medium text-[var(--muted)] shrink-0">
                                  {hour}
                                </span>
                                <div className="flex-1 min-w-0">
                                  {matchingTasks.length > 0 ? (
                                    matchingTasks.map(t => (
                                      <span 
                                        key={t.id} 
                                        className={`inline-block py-0.5 px-2 rounded text-[10px] font-medium mr-1 ${
                                          t.completed 
                                            ? 'bg-black/20 text-[var(--muted)] line-through' 
                                            : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                                        }`}
                                      >
                                        {t.title}
                                      </span>
                                    ))
                                  ) : (
                                    <button
                                      onClick={() => onAddTaskForDate(formattedDateStr, hour)}
                                      className="text-[9px] text-[var(--muted)] hover:text-[var(--txt)] transition-colors font-light"
                                    >
                                      + Planla
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action inside Cell */}
                    <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--muted)] shrink-0">
                      <span>Günün Planı</span>
                      <button
                        onClick={() => setExpandedDayStr(null)}
                        className="hover:text-[var(--txt)] transition-colors"
                      >
                        Küçült
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            /* STANDARD UNIFORM DAY CELL (Diğer günler küçülür, hafifçe soluklaşır) */
            return (
              <div
                key={formattedDateStr}
                onClick={() => setExpandedDayStr(formattedDateStr)}
                className={`h-14 sm:h-16 rounded-xl p-2 cursor-pointer transition-all duration-500 flex flex-col justify-between relative border bg-[var(--surface-elevated)] ${
                  expandedDayStr && !isExpanded 
                    ? 'opacity-40 scale-95 border-[var(--border)] hover:opacity-80' 
                    : isCompletedDay
                      ? 'border-emerald-500/40 hover:border-emerald-500/60'
                      : 'border-[var(--border)] hover:border-[var(--border-hover)]'
                }`}
                title="Tıklayarak büyütün"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--txt)]">
                    {dayNum}
                  </span>
                  {isCompletedDay && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>

                <div className="flex items-center gap-1 overflow-hidden">
                  {dayTasks.slice(0, 3).map((t, idx) => (
                    <span
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full ${t.completed ? 'bg-indigo-400' : 'bg-slate-400'}`}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[9px] text-[var(--muted)] font-medium">+{dayTasks.length - 3}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
