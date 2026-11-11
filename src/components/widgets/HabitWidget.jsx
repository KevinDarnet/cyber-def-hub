import React, { useMemo, useState } from 'react';
import { Plus, Flame, Check, Trash2, X } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

const COLOR_STYLES = {
  violet: 'bg-violet-500 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]',
  cyan: 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(34,211,238,0.5)]',
  emerald: 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
  amber: 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.5)]',
  rose: 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]',
};

const SHORT_DAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    days.push({
      iso: `${y}-${m}-${day}`,
      dayNum: d.getDate(),
      label: SHORT_DAYS[d.getDay()],
      isToday: i === 0,
    });
  }
  return days;
};

const HabitWidget = () => {
  const { habits, createHabit, toggleHabitDate, deleteHabit } = useAppData();

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Ciberseguridad');
  const [color, setColor] = useState('violet');

  const weekDays = useMemo(() => getLast7Days(), []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createHabit({ name: name.trim(), category, color });
    setName('');
    setShowAdd(false);
  };

  return (
    <div className="glass-card flex h-full flex-col p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Habit Tracker
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Constancia diaria • Últimos 7 días
          </p>
        </div>

        <button
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-1 rounded-xl border border-violet-500/30 bg-violet-500/15 px-2.5 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-500/25 dark:text-violet-300"
        >
          {showAdd ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          <span>{showAdd ? 'Cerrar' : 'Hábito'}</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="glass-subcard mb-3.5 space-y-2.5 p-3">
          <input
            type="text"
            placeholder="Ej: 1h Laboratorio CTF / Lectura Técnica"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="os-input py-1.5 text-xs"
            required
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="os-input w-auto py-1 text-xs"
            >
              <option value="Ciberseguridad">Ciberseguridad</option>
              <option value="Ciberdefensa">Ciberdefensa</option>
              <option value="Matemáticas">Matemáticas</option>
              <option value="Programación">Programación</option>
              <option value="Estudio">Estudio General</option>
            </select>

            <div className="flex items-center gap-1.5">
              {Object.keys(COLOR_STYLES).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-4 w-4 rounded-full ${COLOR_STYLES[c].split(' ')[0]} ${
                    color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : 'opacity-60'
                  }`}
                />
              ))}
            </div>

            <button type="submit" className="os-btn-primary px-3 py-1 text-xs">
              Añadir
            </button>
          </div>
        </form>
      )}

      {/* Days Header */}
      <div className="mb-2 flex items-center justify-end gap-1.5 pr-7">
        {weekDays.map((d) => (
          <div
            key={d.iso}
            className={`flex w-7 flex-col items-center text-[10px] font-semibold ${
              d.isToday
                ? 'text-violet-600 dark:text-violet-400'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <span>{d.label}</span>
            <span className="font-mono text-[9px]">{d.dayNum}</span>
          </div>
        ))}
      </div>

      {/* Habits Rows */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
        {habits.map((habit) => {
          const completedSet = new Set(habit.completedDates || []);
          const weekDoneCount = weekDays.filter((d) => completedSet.has(d.iso)).length;
          const activeColor = COLOR_STYLES[habit.color] || COLOR_STYLES.violet;

          return (
            <div
              key={habit._id}
              className="group glass-subcard flex flex-wrap items-center justify-between gap-2 p-2.5"
            >
              <div className="min-w-0 flex-1 pr-2">
                <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {habit.name}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                  <span>{habit.category}</span>
                  <span className="inline-flex items-center gap-0.5 font-mono font-semibold text-amber-500">
                    <Flame className="h-3 w-3" />
                    {weekDoneCount}/7
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {weekDays.map((d) => {
                  const checked = completedSet.has(d.iso);
                  return (
                    <button
                      key={d.iso}
                      onClick={() => toggleHabitDate(habit._id, d.iso)}
                      title={`${habit.name} • ${d.iso}`}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg border text-xs transition-all ${
                        checked
                          ? `${activeColor} border-transparent`
                          : 'border-slate-300/80 bg-white/50 text-transparent hover:border-violet-400 dark:border-white/10 dark:bg-white/[0.03]'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </button>
                  );
                })}

                <button
                  onClick={() => deleteHabit(habit._id)}
                  className="opacity-0 transition group-hover:opacity-100 rounded-lg p-1 text-slate-400 hover:bg-rose-500/15 hover:text-rose-500"
                  title="Eliminar hábito"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HabitWidget;
