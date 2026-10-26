import React, { useState, useRef } from 'react';
import { 
  Plus, 
  MoreVertical, 
  Check, 
  Clock, 
  Trash2, 
  Edit3, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { TaskCard, SubTask } from '../types';

const CARD_PILL_PALETTES = [
  '#6366f1', // soft matte indigo
  '#10b981', // soft matte emerald
  '#f43f5e', // soft matte rose
  '#f59e0b', // soft matte amber
  '#0ea5e9', // soft matte sky
  '#8b5cf6', // soft matte violet
  '#14b8a6', // soft matte teal
  '#f97316'  // soft matte orange
];

interface TaskBoardProps {
  tasks: TaskCard[];
  setTasks: React.Dispatch<React.SetStateAction<TaskCard[]>>;
  filterCategory?: 'all' | 'task' | 'event' | 'todo';
  isPenaltyActive?: boolean;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ 
  tasks, 
  setTasks, 
  filterCategory = 'all',
  isPenaltyActive = false
}) => {
  const [selectedTask, setSelectedTask] = useState<TaskCard | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [resizingTaskId, setResizingTaskId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState<string>('');

  // Drag-and-drop swapping state via instant Pointer Events (0ms delay, touch-action: none)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dropTargetTaskId, setDropTargetTaskId] = useState<string | null>(null);

  // Resize Ref
  const resizeStartRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  const filteredTasks = tasks.filter(t => filterCategory === 'all' || t.category === filterCategory);

  // Handle swapping card positions in sequential order
  const handleCardSwap = (sourceId: string | null, targetId: string) => {
    if (!sourceId || sourceId === targetId || isPenaltyActive) return;
    setTasks(prev => {
      const sourceIndex = prev.findIndex(t => t.id === sourceId);
      const targetIndex = prev.findIndex(t => t.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const next = [...prev];
      const [movedItem] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, movedItem);
      return next;
    });
  };

  // Instant Touch & Pointer Drag Handlers (immediate dragging on contact, no long-press wait, no browser menu)
  const handleDragPointerDown = (e: React.PointerEvent, taskId: string) => {
    if (isPenaltyActive) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    setDraggedTaskId(taskId);
  };

  const handleDragPointerMove = (e: React.PointerEvent) => {
    if (!draggedTaskId) return;
    e.preventDefault();
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const cardEl = el?.closest('[data-task-card-id]') as HTMLElement | null;
    const targetId = cardEl?.getAttribute('data-task-card-id');
    if (targetId && targetId !== draggedTaskId) {
      setDropTargetTaskId(targetId);
    } else {
      setDropTargetTaskId(null);
    }
  };

  const handleDragPointerUp = (e: React.PointerEvent) => {
    if (!draggedTaskId) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    if (dropTargetTaskId && dropTargetTaskId !== draggedTaskId) {
      handleCardSwap(draggedTaskId, dropTargetTaskId);
    }
    setDraggedTaskId(null);
    setDropTargetTaskId(null);
  };

  // Resize handler from the tactile corner notch
  const handleResizePointerDown = (e: React.PointerEvent, task: TaskCard) => {
    if (isPenaltyActive) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    setResizingTaskId(task.id);
    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: task.width || 295,
      startH: task.height || 175
    };
  };

  const handleResizePointerMove = (e: React.PointerEvent) => {
    if (!resizingTaskId || !resizeStartRef.current) return;
    const deltaX = e.clientX - resizeStartRef.current.startX;
    const deltaY = e.clientY - resizeStartRef.current.startY;

    const newW = Math.max(220, Math.min(650, resizeStartRef.current.startW + deltaX));
    const newH = Math.max(140, Math.min(420, resizeStartRef.current.startH + deltaY));

    setTasks(prev => prev.map(t => t.id === resizingTaskId ? { ...t, width: newW, height: newH } : t));
  };

  const handleResizePointerUp = (e: React.PointerEvent) => {
    if (resizingTaskId) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      setResizingTaskId(null);
      resizeStartRef.current = null;
    }
  };

  const handleToggleComplete = (id: string, e?: React.MouseEvent) => {
    if (isPenaltyActive) return;
    if (e) e.stopPropagation();
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id: string) => {
    if (isPenaltyActive) return;
    setTasks(prev => prev.filter(t => t.id !== id));
    setIsDetailModalOpen(false);
  };

  // Helper to ensure each task has a permanently stable pill color that never changes when moved
  const getTaskPillColor = (task: TaskCard) => {
    if (task.pillColor) return task.pillColor;
    let hash = 0;
    for (let i = 0; i < task.id.length; i++) {
      hash = (hash << 5) - hash + task.id.charCodeAt(i);
      hash |= 0;
    }
    return CARD_PILL_PALETTES[Math.abs(hash) % CARD_PILL_PALETTES.length];
  };

  const handleAddNewTask = () => {
    if (isPenaltyActive) return;
    const newTask: TaskCard = {
      id: 'task-' + Date.now(),
      title: 'Yeni Çalışma Hedefi',
      description: 'Detayları eklemek için karta tıklayın.',
      category: 'task',
      completed: false,
      color: '#1a1d2e',
      pillColor: CARD_PILL_PALETTES[Math.floor(Math.random() * CARD_PILL_PALETTES.length)],
      width: 295,
      height: 175,
      x: 0,
      y: 0,
      durationMinutes: 30,
      scheduledTime: '15:00',
      date: new Date().toISOString().split('T')[0],
      subtasks: [],
      createdAt: Date.now()
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const handleSaveDetailModal = (updated: TaskCard) => {
    if (isPenaltyActive) return;
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    setIsDetailModalOpen(false);
  };

  const handleAddSubtask = () => {
    if (isPenaltyActive || !newSubtaskTitle.trim() || !selectedTask) return;
    const newSub: SubTask = {
      id: 'sub-' + Date.now(),
      title: newSubtaskTitle.trim(),
      completed: false
    };
    const updated = {
      ...selectedTask,
      subtasks: [...selectedTask.subtasks, newSub]
    };
    setSelectedTask(updated);
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subId: string) => {
    if (isPenaltyActive || !selectedTask) return;
    const updated = {
      ...selectedTask,
      subtasks: selectedTask.subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s)
    };
    setSelectedTask(updated);
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const handleDeleteSubtask = (subId: string) => {
    if (isPenaltyActive || !selectedTask) return;
    const updated = {
      ...selectedTask,
      subtasks: selectedTask.subtasks.filter(s => s.id !== subId)
    };
    setSelectedTask(updated);
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  return (
    <div className="relative min-h-[75vh] pb-32 select-none px-2 sm:px-3">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--txt)] flex items-center gap-2">
            <span>Görev Alanı</span>
            <span className="text-xs py-0.5 px-2.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--muted)] font-mono">
              {filteredTasks.length} Kutucuk
            </span>
          </h2>
          <p className="text-xs text-[var(--muted)] font-light mt-0.5">
            Üstteki renkli çubuğa dokunarak kutucukların yerini anında değiştirebilir, sağ alt çentikten boyutlandırabilirsiniz.
          </p>
        </div>
      </div>

      {/* Penalty Notice Banner if active (Refined Rose / Crimson styling) */}
      {isPenaltyActive && (
        <div className="mb-3.5 p-3 rounded-2xl bg-rose-950/25 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            <strong>Ceza Süresi Aktif:</strong> Kütüphane ve görevler ceza süresi bitene kadar kilitlidir.
          </span>
        </div>
      )}

      {/* Direct Task Cards Container (Tight, minimal gap between cards, harmonic reflow without overlap) */}
      <div className="flex flex-wrap gap-2 sm:gap-2.5 items-start w-full">
        {filteredTasks.map((task) => {
          const completedSubs = task.subtasks.filter(s => s.completed).length;
          const totalSubs = task.subtasks.length;
          const pillColor = getTaskPillColor(task);
          const isBeingDragged = draggedTaskId === task.id;
          const isDropTarget = dropTargetTaskId === task.id && !isBeingDragged;
          const isBeingResized = resizingTaskId === task.id;

          return (
            <div
              key={task.id}
              data-task-card-id={task.id}
              style={{
                width: `${task.width || 295}px`,
                minHeight: `${task.height || 175}px`,
                flexShrink: 0,
                transition: isBeingResized ? 'none' : 'width 0.12s ease-out, height 0.12s ease-out, transform 0.25s cubic-bezier(0.2, 0, 0, 1), opacity 0.2s ease, border-color 0.2s ease'
              }}
              className={`rounded-[24px] p-3.5 sm:p-4 flex flex-col justify-between select-none border backdrop-blur-md bg-[var(--surface-elevated)] relative shadow-md ${
                task.completed ? 'opacity-65' : 'opacity-100'
              } ${
                isBeingDragged ? 'opacity-40 scale-[0.98] border-dashed border-indigo-400' : ''
              } ${
                isDropTarget ? 'border-indigo-400 ring-2 ring-indigo-400/40 scale-[1.01]' : 'border-[var(--border)] hover:border-[var(--border-hover)]'
              }`}
            >
              {/* 1. Dedicated Top Slender Rounded Pill Bar (Instant Pointer Drag Handle, NO long-press delay, NO browser menu) */}
              <div 
                className="w-full flex items-center justify-center -mt-1 pb-2 select-none"
                title={isPenaltyActive ? '' : 'Dokunup sürükleyerek anında yerini değiştir'}
              >
                <div 
                  onPointerDown={(e) => handleDragPointerDown(e, task.id)}
                  onPointerMove={handleDragPointerMove}
                  onPointerUp={handleDragPointerUp}
                  onPointerCancel={handleDragPointerUp}
                  style={{ 
                    backgroundColor: pillColor,
                    touchAction: 'none',
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                  }}
                  className={`w-12 sm:w-14 h-[3.5px] rounded-full opacity-80 transition-all ${
                    isPenaltyActive ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:opacity-100 hover:scale-x-105'
                  }`}
                />
              </div>

              {/* 2. Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={(e) => handleToggleComplete(task.id, e)}
                    disabled={isPenaltyActive}
                    className={`w-4 h-4 rounded-md flex items-center justify-center transition-all shrink-0 ${
                      task.completed 
                        ? 'bg-indigo-600 text-white' 
                        : 'border border-[var(--border-hover)] hover:border-indigo-400 text-transparent'
                    } ${isPenaltyActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={task.completed ? 'Tamamlandı' : 'Tamamla'}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </button>

                  <h3 className={`text-xs sm:text-sm font-bold text-[var(--txt)] truncate tracking-tight ${
                    task.completed ? 'line-through text-[var(--muted)]' : ''
                  }`}>
                    {task.title}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setIsDetailModalOpen(true);
                  }}
                  className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--txt)] hover:bg-white/5 transition-colors"
                  title="Ayrıntılar"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 3. Card Middle Info */}
              <div className="my-auto py-2">
                <div className="flex items-center gap-2 flex-wrap text-[11px] text-[var(--muted)]">
                  {task.scheduledTime && (
                    <span className="flex items-center gap-1 bg-black/10 dark:bg-black/30 px-2 py-0.5 rounded-md font-mono text-[var(--txt)]">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      {task.scheduledTime}
                    </span>
                  )}
                  {task.durationMinutes > 0 && (
                    <span className="bg-black/10 dark:bg-black/30 px-2 py-0.5 rounded-md">
                      {task.durationMinutes} dk
                    </span>
                  )}
                  {totalSubs > 0 && (
                    <span className="flex items-center gap-1 bg-black/10 dark:bg-black/30 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {completedSubs}/{totalSubs}
                    </span>
                  )}
                </div>
              </div>

              {/* 4. Tactile Corner Notch for Harmonious Resizing */}
              {!isPenaltyActive && (
                <div
                  onPointerDown={(e) => handleResizePointerDown(e, task)}
                  onPointerMove={handleResizePointerMove}
                  onPointerUp={handleResizePointerUp}
                  className="absolute bottom-1.5 right-1.5 cursor-se-resize p-1 text-[var(--muted)] hover:text-indigo-400 touch-none select-none flex items-center justify-center transition-colors"
                  title="Köşeden serbestçe boyutlandır"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="opacity-45 hover:opacity-100 transition-opacity">
                    <path d="M8 2 L2 8 M8 5.5 L5.5 8 M8 8 L8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Solitary Plus Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={handleAddNewTask}
          disabled={isPenaltyActive}
          aria-label="Yeni Görev Ekle"
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-transform ${
            isPenaltyActive 
              ? 'bg-slate-700/60 text-slate-400 cursor-not-allowed opacity-60' 
              : 'btn-accent hover:scale-105 active:scale-95'
          }`}
          title={isPenaltyActive ? 'Ceza süresi bitene kadar görev eklenemez' : 'Yeni Görev Ekle'}
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Details & Subtasks Modal */}
      {isDetailModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="panel w-full max-w-lg p-6 relative overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-extrabold text-[var(--txt)]">Görev Ayrıntıları</h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--txt)] p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
              <div>
                <label className="text-[11px] font-medium text-[var(--muted)] block mb-1">Başlık</label>
                <input
                  type="text"
                  disabled={isPenaltyActive}
                  value={selectedTask.title}
                  onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                  className="clean-input w-full px-3.5 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[var(--muted)] block mb-1">Açıklama</label>
                <textarea
                  rows={2}
                  disabled={isPenaltyActive}
                  value={selectedTask.description}
                  onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                  className="clean-input w-full px-3.5 py-2 text-xs rounded-2xl resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-[var(--muted)] block mb-1">Saat</label>
                  <input
                    type="time"
                    disabled={isPenaltyActive}
                    value={selectedTask.scheduledTime || '14:00'}
                    onChange={(e) => setSelectedTask({ ...selectedTask, scheduledTime: e.target.value })}
                    className="clean-input w-full px-3.5 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[var(--muted)] block mb-1">Süre (Dakika)</label>
                  <input
                    type="number"
                    disabled={isPenaltyActive}
                    min={5}
                    max={240}
                    step={5}
                    value={selectedTask.durationMinutes}
                    onChange={(e) => setSelectedTask({ ...selectedTask, durationMinutes: Number(e.target.value) || 0 })}
                    className="clean-input w-full px-3.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Subtasks */}
              <div className="pt-2 border-t border-[var(--border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[var(--txt)]">Alt Görevler</span>
                  <span className="text-[10px] text-[var(--muted)]">
                    {selectedTask.subtasks.filter(s => s.completed).length}/{selectedTask.subtasks.length} Tamamlandı
                  </span>
                </div>

                <div className="space-y-1.5 mb-3 max-h-36 overflow-y-auto pr-1">
                  {selectedTask.subtasks.map(sub => (
                    <div 
                      key={sub.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs"
                    >
                      <button
                        onClick={() => handleToggleSubtask(sub.id)}
                        disabled={isPenaltyActive}
                        className="flex items-center gap-2 text-left flex-1 min-w-0"
                      >
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 ${
                          sub.completed ? 'bg-emerald-500 text-white' : 'border border-[var(--border)]'
                        }`}>
                          {sub.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className={`truncate ${sub.completed ? 'line-through text-[var(--muted)]' : 'text-[var(--txt)]'}`}>
                          {sub.title}
                        </span>
                      </button>

                      {!isPenaltyActive && (
                        <button
                          onClick={() => handleDeleteSubtask(sub.id)}
                          className="text-[var(--muted)] hover:text-rose-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {!isPenaltyActive && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Yeni alt adım ekle..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                      className="clean-input flex-1 px-3 py-1.5 text-xs"
                    />
                    <button
                      onClick={handleAddSubtask}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      Ekle
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <button
                onClick={() => handleDeleteTask(selectedTask.id)}
                disabled={isPenaltyActive}
                className={`text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 ${
                  isPenaltyActive ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Görevi Sil</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-1.5 rounded-full text-xs text-[var(--muted)] hover:text-white"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleSaveDetailModal(selectedTask)}
                  disabled={isPenaltyActive}
                  className={`btn-accent px-5 py-1.5 text-xs font-bold ${
                    isPenaltyActive ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
