import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

const PomodoroWidget = ({ large = false }) => {
  const { pomodoro } = useAppData();

  const minutes = String(Math.floor(pomodoro.secondsLeft / 60)).padStart(2, '0');
  const seconds = String(pomodoro.secondsLeft % 60).padStart(2, '0');

  const size = large ? 220 : 172;
  const strokeWidth = large ? 10 : 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress =
    pomodoro.totalSeconds > 0
      ? (pomodoro.totalSeconds - pomodoro.secondsLeft) / pomodoro.totalSeconds
      : 0;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="glass-card flex h-full flex-col justify-between p-5">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Focus Timer
        </h2>

        <div className="flex items-center rounded-full bg-slate-200/80 p-0.5 dark:bg-white/[0.06]">
          {[
            { id: 'focus', text: 'Pomodoro' },
            { id: 'shortBreak', text: 'Pausa' },
            { id: 'longBreak', text: 'Largo' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => pomodoro.switchMode(m.id)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                pomodoro.mode === m.id
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-neon-purple'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {m.text}
            </button>
          ))}
        </div>
      </div>

      {/* Circular Ring */}
      <div className="my-4 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="-rotate-90 transform">
            <defs>
              <linearGradient id="pomoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-slate-200 dark:text-white/[0.07]"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#pomoGrad)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-500 ease-linear"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span
              className={`font-mono font-extrabold tracking-tight text-slate-900 dark:text-white ${
                large ? 'text-4xl' : 'text-3xl'
              }`}
            >
              {minutes}:{seconds}
            </span>
            <span className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              {pomodoro.modes[pomodoro.mode]?.label || 'Focus'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => pomodoro.setIsRunning(!pomodoro.isRunning)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-neon-purple transition hover:scale-105 active:scale-95"
          aria-label={pomodoro.isRunning ? 'Pausar' : 'Iniciar'}
        >
          {pomodoro.isRunning ? (
            <Pause className="h-5 w-5 fill-current" />
          ) : (
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          )}
        </button>

        <button
          onClick={pomodoro.reset}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600 transition hover:border-violet-400 hover:text-violet-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:text-white"
          title="Reiniciar temporizador"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
        Sesiones completadas hoy:{' '}
        <span className="font-mono font-bold text-violet-600 dark:text-violet-400">
          {pomodoro.completedSessions}
        </span>
      </div>
    </div>
  );
};

export default PomodoroWidget;
