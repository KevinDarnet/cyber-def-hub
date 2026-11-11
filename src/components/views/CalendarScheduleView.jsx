import React from 'react';
import CalendarWidget from '../widgets/CalendarWidget';
import ScheduleWidget from '../widgets/ScheduleWidget';
import { useAppData } from '../../context/AppDataContext';
import { CalendarDays, Trash2 } from 'lucide-react';

const CalendarScheduleView = () => {
  const { schedule, deleteScheduleEvent, setSelectedDate } = useAppData();

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <CalendarWidget />
        </div>
        <div className="lg:col-span-7">
          <ScheduleWidget />
        </div>
      </div>

      {/* Upcoming Global Timeline */}
      <div className="glass-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-violet-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Próximos Eventos y Clases Registradas
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {schedule.map((ev) => (
            <div
              key={ev._id}
              onClick={() => setSelectedDate(ev.date)}
              className="glass-subcard flex cursor-pointer items-center justify-between gap-3 p-3.5 transition hover:border-violet-400/50"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-violet-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-violet-700 dark:text-violet-300">
                    {ev.date}
                  </span>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {ev.startTime} - {ev.endTime}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                  {ev.title}
                </p>
                {ev.subtitle && (
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {ev.subtitle}
                  </p>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteScheduleEvent(ev._id);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/15 hover:text-rose-500"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarScheduleView;
