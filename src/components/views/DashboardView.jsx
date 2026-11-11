import React from 'react';
import CalendarWidget from '../widgets/CalendarWidget';
import ScheduleWidget from '../widgets/ScheduleWidget';
import AcademicSummaryWidget from '../widgets/AcademicSummaryWidget';
import TaskWidget from '../widgets/TaskWidget';
import PomodoroWidget from '../widgets/PomodoroWidget';
import HabitWidget from '../widgets/HabitWidget';
import QuickNotesWidget from '../widgets/QuickNotesWidget';

const DashboardView = () => {
  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* Row 1: Calendar + Daily Schedule + Academic Telemetry */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <CalendarWidget />
        </div>
        <div className="xl:col-span-4">
          <ScheduleWidget />
        </div>
        <div className="md:col-span-2 xl:col-span-4">
          <AcademicSummaryWidget />
        </div>
      </div>

      {/* Row 2: Task Manager + Integrated Pomodoro Focus Timer */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <TaskWidget />
        </div>
        <div className="xl:col-span-4">
          <PomodoroWidget />
        </div>
      </div>

      {/* Row 3: Habit Tracker + Quick Notes */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-6">
          <HabitWidget />
        </div>
        <div className="xl:col-span-6">
          <QuickNotesWidget />
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
