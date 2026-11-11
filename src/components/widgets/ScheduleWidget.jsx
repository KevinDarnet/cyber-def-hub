import React, { useMemo, useState } from 'react';
import { Plus, Trash2, X, CalendarClock } from 'lucide-react';
import { getTodayISO, useAppData } from '../../context/AppDataContext';

const DOT_COLORS = {
  violet: 'bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]',
  cyan: 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]',
  amber: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]',
  emerald: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]',
  rose: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]',
};

const ScheduleWidget = () => {
  const {
    selectedDate,
    schedule,
    createScheduleEvent,
    deleteScheduleEvent,
  } = useAppData();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [color, setColor] = useState('violet');

  const isToday = selectedDate === getTodayISO();

  const dayEvents = useMemo(
    () =>
      schedule
        .filter((e) => e.date === selectedDate)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [schedule, selectedDate]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createScheduleEvent({
      title: title.trim(),
      subtitle: subtitle.trim(),
      date: selectedDate,
      startTime,
      endTime,
      color,
    });
    setTitle('');
    setSubtitle('');
    setShowForm(false);
  };

  return (
    <div className="glass-card flex h-full flex-col p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {isToday ? 'Agenda de Hoy' : `Agenda • ${selectedDate}`}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {dayEvents.length} {dayEvents.length === 1 ? 'bloque programado' : 'bloques programados'}
          </p>
        </div>

        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 rounded-xl border border-violet-500/30 bg-violet-500/15 px-2.5 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-500/25 dark:text-violet-300"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          <span>{showForm ? 'Cerrar' : 'Agendar'}</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="glass-subcard mb-3 space-y-2.5 p-3"
        >
          <input
            type="text"
            placeholder="Ej: Clase Ciberseguridad Aplicada"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="os-input py-1.5 text-xs"
            required
          />
          <input
            type="text"
            placeholder="Aula / Detalle (opcional)"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="os-input py-1.5 text-xs"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="os-input py-1.5 text-xs font-mono"
              required
            />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="os-input py-1.5 text-xs font-mono"
              required
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {Object.keys(DOT_COLORS).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-4 w-4 rounded-full ${DOT_COLORS[c].split(' ')[0]} ${
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-60'
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

      {/* Timeline List */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 max-h-[250px]">
        {dayEvents.length === 0 ? (
          <div className="flex h-36 flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
            <CalendarClock className="mb-2 h-7 w-7 opacity-50" />
            <p className="text-xs font-medium">Sin eventos para esta fecha</p>
            <p className="text-[11px]">Pulsa &ldquo;Agendar&rdquo; para planificar un bloque</p>
          </div>
        ) : (
          dayEvents.map((ev) => (
            <div
              key={ev._id}
              className="group flex items-start gap-3 rounded-xl p-2 transition hover:bg-slate-200/50 dark:hover:bg-white/[0.04]"
            >
              <div className="w-12 shrink-0 font-mono text-[11px] leading-tight text-slate-500 dark:text-slate-400">
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  {ev.startTime}
                </div>
                <div>{ev.endTime}</div>
              </div>

              <div className="mt-1.5 flex flex-col items-center">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    DOT_COLORS[ev.color] || DOT_COLORS.violet
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {ev.title}
                </p>
                {ev.subtitle && (
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {ev.subtitle}
                  </p>
                )}
              </div>

              <button
                onClick={() => deleteScheduleEvent(ev._id)}
                className="opacity-0 transition group-hover:opacity-100 rounded-lg p-1 text-slate-400 hover:bg-rose-500/15 hover:text-rose-500"
                title="Eliminar evento"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScheduleWidget;
