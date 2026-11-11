import React, { useMemo, useState } from 'react';
import {
  Plus,
  Star,
  Trash2,
  Check,
  Clock,
  Circle,
  X,
} from 'lucide-react';
import { getTodayISO, useAppData } from '../../context/AppDataContext';

const FILTER_TABS = [
  { id: 'all', label: 'Todas' },
  { id: 'pendiente', label: 'Pendiente' },
  { id: 'en_progreso', label: 'En progreso' },
  { id: 'completado', label: 'Completado' },
];

const STATUS_BADGE = {
  pendiente: {
    label: 'Pendiente',
    classes: 'bg-slate-200/80 text-slate-700 dark:bg-white/10 dark:text-slate-300',
  },
  en_progreso: {
    label: 'En progreso',
    classes: 'bg-amber-500/15 text-amber-700 border border-amber-500/30 dark:text-amber-300',
  },
  completado: {
    label: 'Completado',
    classes: 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 dark:text-emerald-300',
  },
};

const TaskWidget = () => {
  const {
    tasks,
    subjects,
    createTask,
    updateTask,
    cycleTaskStatus,
    deleteTask,
  } = useAppData();

  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('pendiente');
  const [priority, setPriority] = useState('media');
  const [dueDate, setDueDate] = useState(getTodayISO());
  const [subjectCode, setSubjectCode] = useState('');

  const filteredTasks = useMemo(() => {
    if (filter === 'all') return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedSubj = subjects.find((s) => String(s.code) === String(subjectCode));

    await createTask({
      title: title.trim(),
      status,
      priority,
      dueDate,
      subjectCode: matchedSubj ? matchedSubj.code : null,
      subjectName: matchedSubj ? matchedSubj.name : '',
    });

    setTitle('');
    setShowAdd(false);
  };

  return (
    <div className="glass-card flex h-full flex-col p-5">
      {/* Header */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Mis Tareas
        </h2>

        <button
          onClick={() => setShowAdd((v) => !v)}
          className="os-btn-primary rounded-full px-3.5 py-1.5 text-xs"
        >
          {showAdd ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          <span>{showAdd ? 'Cancelar' : 'Nueva Tarea'}</span>
        </button>
      </div>

      {/* Filter Pills */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {FILTER_TABS.map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                active
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-neon-purple'
                  : 'bg-slate-200/70 text-slate-600 hover:bg-slate-300/70 dark:bg-white/[0.06] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Quick Create Form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="glass-subcard mb-4 space-y-2.5 p-3.5">
          <input
            type="text"
            placeholder="Descripción de la tarea o entrega académica..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="os-input py-2 text-xs"
            required
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="os-input py-1.5 text-xs"
            >
              <option value="pendiente">Estado: Pendiente</option>
              <option value="en_progreso">Estado: En progreso</option>
              <option value="completado">Estado: Completado</option>
            </select>

            <select
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              className="os-input py-1.5 text-xs"
            >
              <option value="">Sin materia asociada</option>
              {subjects.map((s) => (
                <option key={s._id} value={s.code}>
                  #{s.code} - {s.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="os-input py-1.5 text-xs font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Prioridad:</span>
              {['baja', 'media', 'alta'].map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`rounded-lg px-2 py-0.5 capitalize font-medium ${
                    priority === p
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button type="submit" className="os-btn-primary px-3.5 py-1.5 text-xs">
              Crear Tarea
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="flex-1 divide-y divide-slate-200/70 overflow-y-auto pr-1 dark:divide-white/[0.06] max-h-[290px]">
        {filteredTasks.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
            No hay tareas en este estado.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'completado';
            const isInProgress = task.status === 'en_progreso';
            const badge = STATUS_BADGE[task.status] || STATUS_BADGE.pendiente;

            return (
              <div
                key={task._id}
                className="group flex items-center justify-between gap-3 py-2.5 transition hover:bg-slate-100/60 dark:hover:bg-white/[0.025] px-1.5 rounded-lg"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {/* Cycle Status Circle */}
                  <button
                    onClick={() => cycleTaskStatus(task)}
                    title={`Estado actual: ${badge.label} (clic para cambiar)`}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all ${
                      isDone
                        ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-neon-purple'
                        : isInProgress
                        ? 'border-2 border-amber-400 bg-amber-400/15 text-amber-400'
                        : 'border-2 border-slate-400/70 text-transparent hover:border-violet-400 dark:border-slate-500'
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-3 w-3 stroke-[3]" />
                    ) : isInProgress ? (
                      <Clock className="h-3 w-3" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-medium transition ${
                        isDone
                          ? 'text-slate-400 line-through dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                      {task.subjectName && (
                        <span className="truncate rounded-md bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-300">
                          {task.subjectName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Due Date, Star, Delete */}
                <div className="flex shrink-0 items-center gap-2">
                  {task.dueDate && (
                    <span className="hidden sm:inline font-mono text-[11px] text-slate-400 dark:text-slate-500">
                      {task.dueDate === getTodayISO() ? 'Hoy' : task.dueDate}
                    </span>
                  )}

                  <button
                    onClick={() =>
                      updateTask(task._id, { starred: !task.starred })
                    }
                    className={`p-1 transition ${
                      task.starred
                        ? 'text-violet-500 dark:text-violet-400'
                        : 'text-slate-400 hover:text-violet-400 dark:text-slate-600'
                    }`}
                    title="Destacar tarea"
                  >
                    <Star
                      className={`h-4 w-4 ${task.starred ? 'fill-current' : ''}`}
                    />
                  </button>

                  <button
                    onClick={() => deleteTask(task._id)}
                    className="opacity-0 transition group-hover:opacity-100 rounded-lg p-1 text-slate-400 hover:bg-rose-500/15 hover:text-rose-500"
                    title="Eliminar tarea"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TaskWidget;
