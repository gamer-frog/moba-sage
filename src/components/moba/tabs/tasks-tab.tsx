'use client';

import { motion } from 'framer-motion';
import { ListTodo, Clock, RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '../badges';
import type { TaskItem } from '../types';

export function TasksTab({ tasks, loading, onRefresh, onToggleTask }: {
  tasks: TaskItem[];
  loading: boolean;
  onRefresh: () => void;
  onToggleTask: (task: TaskItem) => void;
}) {
  const runningCount = tasks.filter(t => t.status === 'running').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <ListTodo className="w-5 h-5 text-[#c8aa6e]" />
        <div>
          <h2 className="text-lg font-bold text-[#f0e6d2]">Cola de Tareas Circulares</h2>
          <p className="text-xs text-[#5b5a56]">Tareas automáticas que mantienen los datos actualizados</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-[#0acbe6]">{runningCount}</p>
          <p className="text-[10px] text-[#5b5a56]">Ejecutando</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-[#0acbe6]">{doneCount}</p>
          <p className="text-[10px] text-[#5b5a56]">Completados</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-[#5b5a56]">{pendingCount}</p>
          <p className="text-[10px] text-[#5b5a56]">Pendientes</p>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={onRefresh} className="border-[#785a28]/30 text-[#5b5a56] hover:text-[#f0e6d2] hover:border-[#c8aa6e]/50 text-xs">
        <RefreshCw className="w-3 h-3 mr-1" />
        Refrescar
      </Button>

      {loading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-3 w-full" />
          </div>
        ))
      ) : (
        <div className="space-y-2">
          {tasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: idx * 0.03 }}
              className="glass-card rounded-xl p-4 flex items-start gap-3 group hover:border-[#c8aa6e]/30 transition-colors cursor-pointer"
              onClick={() => onToggleTask(task)}
            >
              <div className="mt-0.5 shrink-0">
                <span className="text-xs font-mono text-[#785a28]">#{task.pointer}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="text-sm font-medium text-[#f0e6d2]">{task.title}</h4>
                  <StatusBadge status={task.status} />
                </div>
                <p className="text-xs text-[#5b5a56] leading-relaxed mb-1">{task.description}</p>
                <div className="flex items-center gap-1 text-[10px] text-[#785a28]">
                  <Clock className="w-3 h-3" />
                  <span>{task.interval} min</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#785a28] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
