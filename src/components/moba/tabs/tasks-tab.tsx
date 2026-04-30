'use client';

import { useMemo } from 'react';
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
  const { runningCount, doneCount, pendingCount } = useMemo(() => tasks.reduce((acc, t) => {
    acc[t.status === 'running' ? 'running' : t.status === 'done' ? 'done' : 'pending']++;
    return acc;
  }, { running: 0, done: 0, pending: 0 }), [tasks]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <ListTodo className="w-5 h-5 text-lol-gold" />
        <div>
          <h2 className="text-lg font-bold text-lol-text">Cola de Tareas Circulares</h2>
          <p className="text-xs text-lol-dim">Tareas automáticas que mantienen los datos actualizados</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-lol-success">{runningCount}</p>
          <p className="text-[10px] text-lol-dim">Ejecutando</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-lol-success">{doneCount}</p>
          <p className="text-[10px] text-lol-dim">Completados</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-lol-dim">{pendingCount}</p>
          <p className="text-[10px] text-lol-dim">Pendientes</p>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={onRefresh} className="border-lol-gold-dark/30 text-lol-dim hover:text-lol-text hover:border-lol-gold/50 text-xs">
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
              className="glass-card rounded-xl p-4 flex items-start gap-3 group hover:border-lol-gold/30 transition-colors cursor-pointer"
              onClick={() => onToggleTask(task)}
            >
              <div className="mt-0.5 shrink-0">
                <span className="text-xs font-mono text-lol-gold-dark">#{task.pointer}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="text-sm font-medium text-lol-text">{task.title}</h4>
                  <StatusBadge status={task.status} />
                </div>
                <p className="text-xs text-lol-dim leading-relaxed mb-1">{task.description}</p>
                <div className="flex items-center gap-1 text-[10px] text-lol-gold-dark">
                  <Clock className="w-3 h-3" />
                  <span>{task.interval} min</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-lol-gold-dark shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
