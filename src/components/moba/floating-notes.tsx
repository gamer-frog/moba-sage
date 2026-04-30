'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lightbulb, X, Send, Trash2, Sparkles, MessageSquare, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { C } from '@/components/moba/theme-colors';

interface Note {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  status: string;
}

export function FloatingNotes() {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [editingAuthor, setEditingAuthor] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load author name from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('moba-sage-notes-author');
    if (saved) { setAuthorName(saved); setEditingAuthor(false); } else { setEditingAuthor(true); }
  }, []);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen, fetchNotes]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const fab = document.getElementById('floating-notes-fab');
        if (fab && !fab.contains(e.target as Node)) {
          setIsOpen(false);
        }
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  async function handleSubmit() {
    if (!newNote.trim() || !authorName.trim()) return;

    const author = authorName.trim();
    setSubmitting(true);

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content: newNote.trim() }),
      });

      if (res.ok) {
        localStorage.setItem('moba-sage-notes-author', author);
        setNewNote('');
        await fetchNotes();
        if (inputRef.current) inputRef.current.focus();
      }
    } catch (err) {
      console.error('Failed to submit note:', err);
      setSubmitError('No se pudo guardar la nota');
      setTimeout(() => setSubmitError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchNotes();
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  }

  function formatTime(ts: string): string {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / 3600000;

    if (diffHours < 1) return 'hace un rato';
    if (diffHours < 24) return `hace ${Math.floor(diffHours)}h`;

    return date.toLocaleDateString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getAuthorColor(name: string): string {
    const colors = [C.gold, C.success, C.danger, C.warning, C.green, '#9d48e0', C.pick];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  return (
    <>
      {/* ===== FAB Button ===== */}
      <motion.button
        id="floating-notes-fab"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-[60] w-14 h-14 rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #c8aa6e, #a07830)',
          boxShadow: '0 4px 24px rgba(200, 170, 110, 0.35), 0 0 60px rgba(200, 170, 110, 0.1), inset 0 1px 0 rgba(255,255,255,0.15)',
          border: '2px solid rgba(200, 170, 110, 0.5)',
        }}
        whileHover={{ scale: 1.08, boxShadow: '0 6px 32px rgba(200, 170, 110, 0.5), 0 0 80px rgba(200, 170, 110, 0.15)' }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        title="Cosas para Mejorar"
        aria-label={isOpen ? 'Cerrar panel de notas' : 'Abrir Cosas para Mejorar'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -180, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 180, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-6 h-6 text-lol-bg" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 180, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -180, opacity: 0 }} transition={{ duration: 0.2 }}>
              <Lightbulb className="w-6 h-6 text-lol-bg" fill="#0a0e1a" />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Pulse indicator */}
        {!isOpen && notes.length > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-lol-bg bg-lol-green border-2 border-lol-bg"
          >
            {notes.length}
          </span>
        )}
      </motion.button>

      {/* ===== Panel ===== */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55]"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="fixed bottom-36 right-4 left-4 sm:left-auto sm:w-[420px] z-[60] rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(14, 18, 27, 0.98), rgba(10, 14, 26, 0.99))',
                border: '1.5px solid rgba(200, 170, 110, 0.3)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(200, 170, 110, 0.08)',
                maxHeight: '70vh',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Header */}
              <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(200, 170, 110, 0.15)', background: 'rgba(200, 170, 110, 0.05)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200, 170, 110, 0.15)', border: '1px solid rgba(200, 170, 110, 0.25)' }}>
                  <Lightbulb className="w-4.5 h-4.5 text-lol-gold" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-lol-text tracking-wide" style={{ fontFamily: 'Beaufort, sans-serif' }}>
                    COSAS PARA MEJORAR
                  </h3>
                  <p className="text-[10px] text-lol-muted">
                    {notes.length} notas · Compartí ideas con el team
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-lol-green animate-pulse" />
                  <span className="text-[10px] text-lol-green">Live</span>
                </div>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 160px)' }}>
                {/* Notes list */}
                <div className="p-3 space-y-2">
                  {notes.length === 0 && (
                    <div className="text-center py-8">
                      <Sparkles className="w-10 h-10 mx-auto mb-2 text-lol-gold/30" />
                      <p className="text-xs text-lol-muted">Sin notas todavia</p>
                      <p className="text-[10px] text-lol-dim mt-1">Agregá la primera idea para mejorar la app</p>
                    </div>
                  )}

                  {notes.map((note, i) => {
                    const authorColor = getAuthorColor(note.author);
                    return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group rounded-xl p-3 transition-all hover:bg-white/[0.03]"
                      style={{
                        background: 'rgba(30, 35, 40, 0.6)',
                        border: '1px solid rgba(120, 90, 40, 0.12)',
                      }}
                    >
                      <div className="flex items-start gap-2.5">
                        {/* Author avatar */}
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                          style={{
                            background: `${authorColor}18`,
                            color: authorColor,
                            border: `1px solid ${authorColor}30`,
                          }}
                        >
                          {note.author[0]?.toUpperCase()}
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[11px] font-semibold text-lol-text">{note.author}</span>
                            <span className="text-[10px] text-lol-dim">{formatTime(note.timestamp)}</span>
                          </div>
                          <p className="text-[12px] text-lol-muted leading-relaxed">{note.content}</p>
                        </div>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-lol-danger/20 transition-all shrink-0 cursor-pointer"
                          title="Eliminar nota"
                          aria-label="Eliminar nota"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-lol-danger/60 hover:text-lol-danger" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
                </div>
              </div>

              {/* Input area */}
              <div className="px-3 pb-3 pt-2" style={{ borderTop: '1px solid rgba(120, 90, 40, 0.15)' }}>
                {submitError && (
                  <div className="flex items-center gap-1.5 mb-2 text-[10px] text-lol-danger">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}
                {/* Author name — show input while editing, show name once saved */}
                {editingAuthor && (
                  <div className="mb-2">
                    <Input
                      placeholder="Tu nombre (se guarda)"
                      value={authorName}
                      onChange={e => setAuthorName(e.target.value)}
                      onBlur={() => { if (authorName.trim()) { localStorage.setItem('moba-sage-notes-author', authorName); setEditingAuthor(false); } }}
                      onKeyDown={e => { if (e.key === 'Enter' && authorName.trim()) { localStorage.setItem('moba-sage-notes-author', authorName); setEditingAuthor(false); } }}
                      className="h-8 text-xs bg-lol-card/80 border-lol-gold-dark/30 text-lol-text placeholder:text-lol-dim rounded-lg"
                      maxLength={30}
                      autoFocus={false}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    placeholder="Escribí una idea para mejorar..."
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    className="flex-1 min-h-[38px] max-h-[100px] px-3 py-2 text-xs rounded-lg resize-none bg-lol-card/80 border border-lol-gold-dark/30 text-lol-text placeholder:text-lol-dim focus:outline-none focus:border-lol-gold/50 focus:ring-1 focus:ring-[#c8aa6e]/20 transition-colors"
                    rows={1}
                    maxLength={500}
                  />
                  <motion.button
                    onClick={handleSubmit}
                    disabled={submitting || !newNote.trim()}
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background: newNote.trim() ? 'linear-gradient(135deg, #c8aa6e, #a07830)' : 'rgba(120, 90, 40, 0.2)',
                      border: '1px solid rgba(200, 170, 110, 0.3)',
                    }}
                    whileHover={newNote.trim() ? { scale: 1.05 } : {}}
                    whileTap={newNote.trim() ? { scale: 0.95 } : {}}
                    aria-label="Enviar nota"
                  >
                    <Send className="w-4 h-4 text-lol-bg" />
                  </motion.button>
                </div>
                {authorName && (
                  <p className="text-[10px] text-lol-dim mt-1.5 flex items-center gap-1">
                    <MessageSquare className="w-2.5 h-2.5" />
                    Publicando como <span className="text-lol-gold font-medium">{authorName}</span>
                    <button onClick={() => { setAuthorName(''); setEditingAuthor(true); localStorage.removeItem('moba-sage-notes-author'); }} className="ml-1 text-lol-danger/60 hover:text-lol-danger cursor-pointer">cambiar</button>
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
