import React, { useState } from 'react';
import { motion, Reorder } from 'motion/react';
import { 
  Trello, 
  MoreHorizontal, 
  Plus, 
  Clock, 
  Circle, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';
import { Task } from '../../types';
import { cn } from '../../lib/utils';

export default function Forge() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Refine Design Architecture', status: 'doing', priority: 'high' },
    { id: '2', title: 'Core Interface Refactoring', status: 'todo', priority: 'medium' },
    { id: '3', title: 'System Security Audit', status: 'done', priority: 'low' },
    { id: '4', title: 'Neural Engine Integration', status: 'todo', priority: 'high' },
  ]);

  const columns: { id: Task['status']; label: string; icon: any }[] = [
    { id: 'todo', label: 'Backlog', icon: Circle },
    { id: 'doing', label: 'In Progress', icon: Clock },
    { id: 'done', label: 'Deployed', icon: CheckCircle2 },
  ];

  const moveTask = (id: string, status: Task['status']) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  const addTask = (status: Task['status']) => {
    const title = prompt('Task title:');
    if (!title) return;
    setTasks([...tasks, { 
      id: crypto.randomUUID(), 
      title, 
      status, 
      priority: 'medium' 
    }]);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] overflow-hidden text-[#ededed]">
      <header className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-rose-500 to-[#60a5fa] rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Trello size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-medium tracking-tight text-white">Forge</h2>
            <p className="text-[10px] text-[#a1a1a1] font-mono uppercase tracking-[0.2em]">Execution Core</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-white/[0.05] px-3 py-1.5 rounded-lg border border-white/5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-bold font-mono text-white/40 uppercase tracking-widest">Active</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-8 p-8 overflow-x-auto bg-[#0a0a0a]">
        {columns.map(col => (
          <div key={col.id} className="flex-1 flex flex-col min-w-[320px] max-w-[400px]">
            <div className="flex items-center justify-between mb-6 group">
              <div className="flex items-center gap-2">
                <col.icon size={16} className={cn(
                    col.id === 'todo' && "text-white/20",
                    col.id === 'doing' && "text-blue-400",
                    col.id === 'done' && "text-emerald-400"
                )} />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">{col.label}</h3>
                <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded-full text-white/20 font-mono">
                  {tasks.filter(t => t.status === col.id).length}
                </span>
              </div>
              <button 
                onClick={() => addTask(col.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded transition-all text-white/40 hover:text-white"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="flex-1 space-y-4">
              {tasks.filter(t => t.status === col.id).map(task => (
                <motion.div
                  layoutId={task.id}
                  key={task.id}
                  className="p-5 bg-white/[0.03] rounded-2xl border border-white/5 shadow-sm hover:border-white/10 transition-all group relative cursor-grab active:cursor-grabbing"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={cn(
                      "text-[8px] px-2 py-0.5 rounded font-bold uppercase tracking-widest",
                      task.priority === 'high' && "bg-rose-500/10 text-rose-400 border border-rose-500/20",
                      task.priority === 'medium' && "bg-orange-500/10 text-orange-400 border border-orange-500/20",
                      task.priority === 'low' && "bg-blue-500/10 text-blue-400 border border-blue-500/20",
                    )}>
                      {task.priority}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-white">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                  <h4 className="text-sm font-medium text-white/90 leading-relaxed font-sans">{task.title}</h4>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex -space-x-1.5 grayscale opacity-50">
                      <div className="w-6 h-6 rounded-full bg-indigo-500 border border-black" />
                      <div className="w-6 h-6 rounded-full bg-emerald-500 border border-black" />
                    </div>
                    {col.id !== 'done' && (
                       <button 
                        onClick={() => moveTask(task.id, col.id === 'todo' ? 'doing' : 'done')}
                        className="text-[9px] text-white/20 hover:text-white font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
                       >
                         Next Step <ArrowUpRight size={10} />
                       </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
