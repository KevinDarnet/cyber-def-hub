import React, { useMemo, useState } from 'react';
import { Plus, Pin, Trash2, Search } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

const CARD_ACCENTS = {
  violet: 'border-t-4 border-t-violet-500',
  cyan: 'border-t-4 border-t-cyan-400',
  emerald: 'border-t-4 border-t-emerald-400',
  amber: 'border-t-4 border-t-amber-400',
  rose: 'border-t-4 border-t-rose-500',
};

const COLOR_DOTS = {
  violet: 'bg-violet-500',
  cyan: 'bg-cyan-400',
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  rose: 'bg-rose-500',
};

const NotesVaultView = () => {
  const { notes, createNote, updateNote, deleteNote } = useAppData();

  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('Ciberseguridad');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('violet');

  const filtered = useMemo(() => {
    if (!query.trim()) return notes;
    const q = query.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.tag || '').toLowerCase().includes(q)
    );
  }, [notes, query]);

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
  };

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* Note Creator & Search */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <form
          onSubmit={handleCreate}
          className="glass-card space-y-3 p-5 lg:col-span-7"
        >
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Nueva Nota Rápida / Snippet
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              type="text"
              placeholder="Título de la nota..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="os-input sm:col-span-2"
              required
            />
            <input
              type="text"
              placeholder="Etiqueta (ej: Linux, Álgebra)"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="os-input"
            />
          </div>
          <textarea
            rows={3}
            placeholder="Escribe apuntes rápidos, comandos de terminal, fórmulas o ideas..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="os-input"
            required
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Color:
              </span>
              {Object.keys(COLOR_DOTS).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-4 w-4 rounded-full ${COLOR_DOTS[c]} ${
                    color === c
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                      : 'opacity-60'
                  }`}
                />
              ))}
            </div>
            <button type="submit" className="os-btn-primary text-xs">
              <Plus className="h-4 w-4" />
              Guardar Nota
            </button>
          </div>
        </form>

        <div className="glass-card flex flex-col justify-between p-5 lg:col-span-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Bóveda de Notas Rápidas
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Filtra tus notas por palabra clave, comando o etiqueta. Para apuntes extensos por asignatura, usa el Espacio dentro de cada Materia.
            </p>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar en tus notas..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="os-input pl-10"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-3 text-xs text-slate-500 dark:border-white/[0.07] dark:text-slate-400">
            <span>Total guardadas: {notes.length}</span>
            <span>Fijadas: {notes.filter((n) => n.pinned).length}</span>
          </div>
        </div>
      </div>

      {/* Notes Masonry/Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((note) => (
          <div
            key={note._id}
            className={`glass-card flex flex-col justify-between p-5 ${
              CARD_ACCENTS[note.color] || CARD_ACCENTS.violet
            }`}
          >
            <div>
              <div className="mb-2 flex items-start justify-between gap-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {note.title}
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      updateNote(note._id, { pinned: !note.pinned })
                    }
                    className={`rounded-lg p-1.5 transition ${
                      note.pinned
                        ? 'bg-violet-500/15 text-violet-500'
                        : 'text-slate-400 hover:bg-slate-200/70 dark:hover:bg-white/10'
                    }`}
                    title={note.pinned ? 'Desfijar' : 'Fijar arriba'}
                  >
                    <Pin className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteNote(note._id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/15 hover:text-rose-500"
                    title="Eliminar nota"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="whitespace-pre-line text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {note.content}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-2.5 dark:border-white/[0.07]">
              <span className="rounded-md bg-violet-500/15 px-2 py-0.5 text-[11px] font-semibold text-violet-700 dark:text-violet-300">
                #{note.tag || 'General'}
              </span>
              {note.pinned && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-500">
                  Fijada
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesVaultView;
