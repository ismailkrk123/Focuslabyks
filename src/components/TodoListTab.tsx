import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Clock, 
  CheckCheck,
  ListTodo
} from 'lucide-react';
import { TaskCard } from '../types';

interface TodoListTabProps {
  tasks: TaskCard[];
  setTasks: React.Dispatch<React.SetStateAction<TaskCard[]>>;
}

export const TodoListTab: React.FC<TodoListTabProps> = ({ tasks, setTasks }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDuration, setNewDuration] = useState<number>(30);
  const [newCategory, setNewCategory] = useState<'task' | 'event' | 'todo'>('todo');

  const todos = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCard: TaskCard = {
      id: 'todo-' + Date.now(),
      title: newTitle.trim(),
      description: 'To-do listesi öğesi',
      category: newCategory,
      completed: false,
      color: '#1a1d2e',
      width: 280,
      height: 160,
      x: 30,
      y: 30,
      durationMinutes: newDuration,
      scheduledTime: '12:00',
      date: new Date().toISOString().split('T')[0],
      subtasks: [],
      createdAt: Date.now()
    };

    setTasks(prev => [newCard, ...prev]);
    setNewTitle('');
  };

  const handleToggle = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDelete = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 select-none px-2 sm:px-4">
      {/* Header and Progress Card */}
      <div className="panel p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-extrabold text-[var(--txt)] tracking-tight">To-Do Listesi & Öncelikler</h2>
            </div>
            <p className="text-xs text-[var(--muted)] font-light mt-1">
              Günlük yapılacakları planlayın, önceliklendirin ve hedeflerinize adım adım ilerleyin.
            </p>
          </div>

          <div className="w-full sm:w-56 metric-box p-3.5">
            <div className="flex justify-between text-xs text-[var(--muted)] font-medium mb-1.5">
              <span>Tamamlanma</span>
              <span className="text-indigo-400 font-extrabold font-mono">%{progressPercent}</span>
            </div>
            <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-[var(--muted)] mt-1.5 text-right font-mono">
              {completedCount} / {tasks.length} tamamlandı
            </p>
          </div>
        </div>

        {/* Inline Add New Form */}
        <form onSubmit={handleCreateTodo} className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Yapılacak yeni bir madde yazın... (Enter)"
            className="flex-1 clean-input px-4 py-2.5 text-xs text-[var(--txt)] placeholder:text-[var(--muted)]"
          />

          <div className="flex gap-2">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="clean-input px-3 py-2 text-xs text-[var(--txt)] cursor-pointer"
            >
              <option value="todo" className="bg-slate-900 text-white">To-Do</option>
              <option value="task" className="bg-slate-900 text-white">Görev</option>
              <option value="event" className="bg-slate-900 text-white">Etkinlik</option>
            </select>

            <button
              type="submit"
              className="btn-accent px-5 py-2.5 text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Ekle</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`py-1.5 px-4 rounded-full text-xs transition-colors ${
            filter === 'all'
              ? 'bg-white/10 text-[var(--txt)] font-extrabold border border-[var(--border)]'
              : 'text-[var(--muted)] hover:text-[var(--txt)] metric-box'
          }`}
        >
          Tümü ({tasks.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`py-1.5 px-4 rounded-full text-xs transition-colors ${
            filter === 'pending'
              ? 'bg-white/10 text-[var(--txt)] font-extrabold border border-[var(--border)]'
              : 'text-[var(--muted)] hover:text-[var(--txt)] metric-box'
          }`}
        >
          Bekleyenler ({tasks.length - completedCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`py-1.5 px-4 rounded-full text-xs transition-colors ${
            filter === 'completed'
              ? 'bg-white/10 text-[var(--txt)] font-extrabold border border-[var(--border)]'
              : 'text-[var(--muted)] hover:text-[var(--txt)] metric-box'
          }`}
        >
          Tamamlananlar ({completedCount})
        </button>
      </div>

      {/* Todo Items List */}
      <div className="space-y-2">
        {todos.map(task => (
          <div
            key={task.id}
            className={`p-3.5 sm:p-4 rounded-xl metric-box transition-all flex items-center justify-between gap-3 ${
              task.completed ? 'opacity-50' : 'opacity-100 hover:border-[var(--border-hover)]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={() => handleToggle(task.id)}
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                  task.completed 
                    ? 'bg-indigo-600 text-white' 
                    : 'border border-[var(--border-hover)] text-transparent'
                }`}
              >
                ✓
              </button>

              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium text-[var(--txt)] truncate ${
                  task.completed ? 'line-through text-[var(--muted)]' : ''
                }`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--muted)]">
                  <span className="capitalize px-2 py-0.5 bg-black/20 rounded-md text-[10px]">
                    {task.category === 'todo' ? 'To-Do' : task.category === 'task' ? 'Görev' : 'Etkinlik'}
                  </span>
                  {task.scheduledTime && (
                    <span className="flex items-center gap-1 font-mono text-indigo-400">
                      <Clock className="w-3 h-3" />
                      {task.scheduledTime}
                    </span>
                  )}
                  {task.durationMinutes > 0 && (
                    <span>• {task.durationMinutes} dk</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDelete(task.id)}
              className="text-[var(--muted)] hover:text-rose-400 p-2 rounded-full hover:bg-white/5 transition-colors"
              title="Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {todos.length === 0 && (
          <div className="panel p-12 text-center text-[var(--muted)]">
            <CheckCheck className="w-8 h-8 text-[var(--muted)] mx-auto mb-2 opacity-40" />
            <p className="text-xs font-light">Bu filtrede gösterilecek madde yok.</p>
          </div>
        )}
      </div>
    </div>
  );
};
