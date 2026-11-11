import React, { useState } from 'react';
import {
  Plus,
  Star,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Circle,
} from 'lucide-react';
import { getTodayISO, useAppData } from '../../context/AppDataContext';

const COLUMNS = [
  {
    id: 'pendiente',
    title: 'Pendiente',
    icon: Circle,
    accent: 'border-t-slate-400',
    badge: 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300',
  },
  {
    id: 'en_progreso',
    title: 'En progreso',
    icon: Clock,
    accent: 'border-t-amber-400',
    badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  },
  {
    id: 'completado',
    title: 'Completado',
    icon: CheckCircle2,
    accent: 'border-t-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  },
];

const TaskManagerView = () => {
  const { tasks, subjects, createTask, updateTask, deleteTask } = useAppData();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('media');
  const [dueDate, setDueDate] = useState(getTodayISO());
  const [subjectCode, setSubjectCode] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const subj = subjects.find((s) => String(s.code) === String(subjectCode));

    await createTask({
      title: title.trim(),
      description: description.trim(),
      status: 'pendiente',
      priority,
      dueDate,
      subjectCode: subj ? subj.code : null,
      subjectName: subj ? subj.name : '',
    });

    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* Quick Task Creator Bar */}
      <form onSubmit={handleCreate} className="glass-card space-y-3 p-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Tablero Kanban de Tareas Académicas
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <input
            type="text"
            placeholder="Título de la nueva tarea, laboratorio o parcial..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="os-input md:col-span-4"
            required
          />
          <input
            type="text"
            placeholder="Detalle corto (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="os-input md:col-span-3"
          />
          <select
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
            className="os-input md:col-span-2"
          >
            <option value="">Materia (opcional)</option>
            {subjects.map((s) => (
              <option key={s._id} value={s.code}>
                #{s.code} {s.name}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="os-input md:col-span-1"
          >
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="os-input font-mono text-xs md:col-span-2"
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="os-btn-primary text-xs">
            <Plus className="h-4 w-4" />
            Agregar al Tablero
          </button>
        </div>
      </form>

      {/* 3-Column Kanban */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {COLUMNS.map((col, colIdx) => {
          const ColIcon = col.icon;
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`glass-card flex flex-col border-t-4 ${col.accent} p-4`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ColIcon className="h-4 w-4 text-violet-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {col.title}
                  </h3>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-xs font-bold ${col.badge}`}
                >
                  {colTasks.length}
                </span>
              </div>

              <div className="flex-1 space-y-3">
                {colTasks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300/70 py-10 text-center text-xs text-slate-400 dark:border-white/10">
                    Sin tareas en {col.title.toLowerCase()}
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div key={task._id} className="glass-subcard space-y-2.5 p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {task.title}
                        </p>
                        <button
                          onClick={() =>
                            updateTask(task._id, { starred: !task.starred })
                          }
                          className={`shrink-0 ${
                            task.starred
                              ? 'text-violet-500'
                              : 'text-slate-400 hover:text-violet-400'
                          }`}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              task.starred ? 'fill-current' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                            task.priority === 'alta'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300'
                              : task.priority === 'media'
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
                              : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                        {task.subjectName && (
                          <span className="truncate rounded bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-300">
                            {task.subjectName}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="ml-auto font-mono text-[10px] text-slate-400">
                            {task.dueDate}
                          </span>
                        )}
                      </div>

                      {/* Move / Delete controls */}
                      <div className="flex items-center justify-between border-t border-slate-200/70 pt-2 dark:border-white/[0.06]">
                        <div className="flex items-center gap-1">
                          {colIdx > 0 && (
                            <button
                              onClick={() =>
                                updateTask(task._id, {
                                  status: COLUMNS[colIdx - 1].id,
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-200/80 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-violet-500 hover:text-white dark:bg-white/10 dark:text-slate-300"
                              title={`Mover a ${COLUMNS[colIdx - 1].title}`}
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </button>
                          )}
                          {colIdx < COLUMNS.length - 1 && (
                            <button
                              onClick={() =>
                                updateTask(task._id, {
                                  status: COLUMNS[colIdx + 1].id,
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-violet-500/15 px-2.5 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-600 hover:text-white dark:text-violet-300"
                              title={`Mover a ${COLUMNS[colIdx + 1].title}`}
                            >
                              <span>Avanzar</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => deleteTask(task._id)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-rose-500/15 hover:text-rose-500"
                          title="Eliminar tarea"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskManagerView;
