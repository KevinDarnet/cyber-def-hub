import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getTodayISO, useAppData } from '../../context/AppDataContext';

const DAYS_HEADER = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const CalendarWidget = () => {
  const { selectedDate, setSelectedDate, schedule, tasks } = useAppData();
  const todayISO = getTodayISO();

  const initialParts = selectedDate.split('-').map(Number);
  const [viewYear, setViewYear] = useState(initialParts[0]);
  const [viewMonth, setViewMonth] = useState(initialParts[1] - 1); // 0-indexed

  const markedDates = useMemo(() => {
    const map = new Set();
    schedule.forEach((ev) => ev.date && map.add(ev.date));
    tasks.forEach((t) => t.dueDate && t.status !== 'completado' && map.add(t.dueDate));
    return map;
  }, [schedule, tasks]);

  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];

    // Trailing days from previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      cells.push({
        day: daysInPrevMonth - i,
        currentMonth: false,
        iso: null,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(viewMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      cells.push({
        day: d,
        currentMonth: true,
        iso: `${viewYear}-${mStr}-${dStr}`,
      });
    }

    // Leading days from next month to complete 42 or 35 grid
    const totalSlots = cells.length <= 35 ? 35 : 42;
    let nextDay = 1;
    while (cells.length < totalSlots) {
      cells.push({
        day: nextDay++,
        currentMonth: false,
        iso: null,
      });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <div className="glass-card flex h-full flex-col justify-between p-5">
      <div>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Calendario
          </h2>
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevMonth}
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[110px] text-center text-xs font-semibold text-slate-700 dark:text-slate-200">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              onClick={nextMonth}
              className="rounded-lg p-1 text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Days of week */}
        <div className="mb-2 grid grid-cols-7 text-center">
          {DAYS_HEADER.map((d, idx) => (
            <span
              key={idx}
              className="text-[11px] font-semibold text-slate-400 dark:text-slate-500"
            >
              {d}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {calendarCells.map((cell, index) => {
            if (!cell.currentMonth) {
              return (
                <div
                  key={index}
                  className="flex h-8 items-center justify-center text-xs text-slate-300 dark:text-slate-700"
                >
                  {cell.day}
                </div>
              );
            }

            const isSelected = cell.iso === selectedDate;
            const isToday = cell.iso === todayISO;
            const hasActivity = markedDates.has(cell.iso);

            return (
              <button
                key={cell.iso}
                onClick={() => setSelectedDate(cell.iso)}
                className={`relative mx-auto flex h-8 w-8 flex-col items-center justify-center rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600 font-bold text-white shadow-neon-purple'
                    : isToday
                    ? 'border border-violet-500/60 bg-violet-500/10 font-bold text-violet-700 dark:text-violet-300'
                    : 'text-slate-700 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-white/10'
                }`}
              >
                <span>{cell.day}</span>
                {hasActivity && (
                  <span
                    className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-violet-400'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer helper */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-200/70 pt-2.5 text-[11px] text-slate-500 dark:border-white/[0.07] dark:text-slate-400">
        <span>Día activo: {selectedDate}</span>
        {selectedDate !== todayISO && (
          <button
            onClick={() => {
              const parts = todayISO.split('-').map(Number);
              setViewYear(parts[0]);
              setViewMonth(parts[1] - 1);
              setSelectedDate(todayISO);
            }}
            className="font-semibold text-violet-600 hover:underline dark:text-violet-400"
          >
            Ir a Hoy
          </button>
        )}
      </div>
    </div>
  );
};

export default CalendarWidget;
