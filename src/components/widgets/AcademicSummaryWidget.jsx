import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Award, BookOpen, ArrowUpRight } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';

const AcademicSummaryWidget = () => {
  const navigate = useNavigate();
  const { academicStats, setActiveSection } = useAppData();
  const { userProfile } = useAuth();

  const intermediatePct = Math.min(
    100,
    Math.round(
      (academicStats.basicApprovedHours / academicStats.intermediateHours) * 100
    )
  );

  return (
    <div className="glass-card flex h-full flex-col justify-between p-5">
      <div>
        <div className="mb-3 flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
              <GraduationCap className="h-3 w-3" />
              {userProfile?.career?.name || userProfile?.careerConfig?.name || 'Carrera Universitaria'}
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white">
                {academicStats.progressPct}%
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                completado ({academicStats.approvedCount}/{academicStats.total})
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveSection('academic');
              navigate('/plan');
            }}
            className="rounded-xl border border-slate-200 bg-slate-100 p-2 text-slate-600 transition hover:border-violet-400 hover:text-violet-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:text-violet-300"
            title="Abrir Plan de Estudios Completo"
          >
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        {/* Intermediate Degree Progress */}
        <div className="glass-subcard mb-3 p-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
              <Award className="h-3.5 w-3.5 text-amber-400" />
              {userProfile?.career?.intermediateTitle || userProfile?.careerConfig?.intermediateTitle || 'Ciclo Básico / Intermedio'}
            </span>
            <span className="font-mono text-[11px] font-bold text-violet-600 dark:text-violet-300">
              {intermediatePct}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${intermediatePct}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            {academicStats.basicApprovedHours} / {academicStats.intermediateHours} hs Ciclo Básico
          </p>
        </div>
      </div>

      {/* Bottom 3 mini metrics (styled like the 3-day forecast row in the OS mockup) */}
      <div className="grid grid-cols-3 gap-2 border-t border-slate-200/70 pt-3 text-center dark:border-white/[0.07]">
        <div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Cursando</p>
          <p className="mt-0.5 flex items-center justify-center gap-1 font-mono text-sm font-bold text-cyan-600 dark:text-cyan-400">
            <BookOpen className="h-3.5 w-3.5" />
            {academicStats.inProgressCount}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Promedio</p>
          <p className="mt-0.5 font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {academicStats.avgGrade}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Horas Tot.</p>
          <p className="mt-0.5 font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
            {academicStats.totalHoursCompleted}h
          </p>
        </div>
      </div>
    </div>
  );
};

export default AcademicSummaryWidget;
