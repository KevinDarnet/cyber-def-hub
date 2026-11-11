import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pin, Trash2, X, StickyNote } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

const NOTE_BORDERS = {
  violet: 'border-l-4 border-l-violet-500',
  cyan: 'border-l-4 border-l-cyan-400',
  emerald: 'border-l-4 border-l-emerald-400',
  amber: 'border-l-4 border-l-amber-400',
  rose: 'border-l-4 border-l-rose-500',
};

const COLOR_DOTS = {
  violet: 'bg-violet-500',
  cyan: 'bg-cyan-400',
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  rose: 'bg-rose-500',
};

const QuickNotesWidget = () => {
  const navigate = useNavigate();
  const { notes, createNote, updateNote, deleteNote, setActiveSection } =
    useAppData();

  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('Estudio');
  const [color, setColor] = useState('violet');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    await createNote({
      title: title.trim(),
      content: content.trim(),
      tag: tag.trim() || 'General',
      color,
      pinned: false,
    });
    setTitle('');
    setContent('');
    setShowAdd(false);
  };

  return (
    <div className="glass-card flex h-full flex-col p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Notas Rápidas
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Snippets, comandos y recordatorios
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveSection('notes');
              navigate('/notas');
            }}
            className="text-xs font-medium text-slate-500 hover:text-violet-500 dark:text-slate-400 dark:hover:text-violet-300"
          >
            Ver todas
          </button>
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="flex items-center gap-1 rounded-xl border border-violet-500/30 bg-violet-500/15 px-2.5 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-500/25 dark:text-violet-300"
          >
            {showAdd ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            <span>{showAdd ? 'Cerrar' : 'Nota'}</span>
          </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="glass-subcard mb-3.5 space-y-2 p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input
              type="text"
              placeholder="Título..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="os-input py-1.5 text-xs sm:col-span-2"
              required
            />
            <input
              type="text"
              placeholder="Etiqueta"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="os-input py-1.5 text-xs"
            />
          </div>
          <textarea
            rows={2}
            placeholder="Escribe una nota rápida, comando o idea..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="os-input py-1.5 text-xs"
            required
          />
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {Object.keys(COLOR_DOTS).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-4 w-4 rounded-full ${COLOR_DOTS[c]} ${
                    color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : 'opacity-60'
                  }`}
                />
              ))}
            </div>
            <button type="submit" className="os-btn-primary px-3 py-1 text-xs">
              Guardar
            </button>
          </div>
        </form>
      )}

      {/* Notes Grid */}
      <div className="grid flex-1 grid-cols-1 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2 max-h-[240px]">
        {notes.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-8 text-slate-400">
            <StickyNote className="mb-1.5 h-6 w-6 opacity-50" />
            <span className="text-xs">Aún no hay notas rápidas</span>
          </div>
        ) : (
          notes.slice(0, 6).map((note) => (
            <div
              key={note._id}
              className={`group glass-subcard flex flex-col justify-between p-3 ${
                NOTE_BORDERS[note.color] || NOTE_BORDERS.violet
              }`}
            >
              <div>
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h3 className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                    {note.title}
                  </h3>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() =>
                        updateNote(note._id, { pinned: !note.pinned })
                      }
                      className={`p-0.5 transition ${
                        note.pinned
                          ? 'text-violet-500 dark:text-violet-400'
                          : 'text-slate-400 opacity-0 group-hover:opacity-100'
                      }`}
                      title="Fijar nota"
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteNote(note._id)}
                      className="p-0.5 text-slate-400 opacity-0 transition hover:text-rose-500 group-hover:opacity-100"
                      title="Eliminar nota"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="line-clamp-3 whitespace-pre-line text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {note.content}
                </p>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  #{note.tag || 'General'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuickNotesWidget;
