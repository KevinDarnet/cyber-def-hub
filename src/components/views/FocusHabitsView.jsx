import React from 'react';
import PomodoroWidget from '../widgets/PomodoroWidget';
import HabitWidget from '../widgets/HabitWidget';
import { Sparkles } from 'lucide-react';

const FocusHabitsView = () => {
  return (
    <div className="space-y-5 pb-20 md:pb-6">
      <div className="glass-card flex items-center gap-3 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 text-white shadow-neon-purple">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Estación Deep Work & Seguimiento de Hábitos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            El temporizador Pomodoro sigue activo en segundo plano aunque cambies de módulo en el Dashboard OS.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <PomodoroWidget large />
        </div>
        <div className="lg:col-span-7">
          <HabitWidget />
        </div>
      </div>
    </div>
  );
};

export default FocusHabitsView;
