import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from './Sidebar';
import { useAppData } from '../../context/AppDataContext';

const BottomDock = () => {
  const location = useLocation();
  const { setActiveSection } = useAppData();

  const isItemActive = (item) => {
    if (location.pathname === item.path) return true;
    if (item.id === 'academic' && (location.pathname === '/plan' || location.pathname === '/academic')) return true;
    if (item.id === 'summaries' && (location.pathname === '/resumenes' || location.pathname === '/articulos')) return true;
    if (item.id === 'calendar' && (location.pathname === '/agenda' || location.pathname === '/calendario')) return true;
    if (item.id === 'tasks' && location.pathname === '/tareas') return true;
    if (item.id === 'notes' && location.pathname === '/notas') return true;
    if (item.id === 'focus' && location.pathname === '/focus') return true;
    return false;
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 flex md:hidden justify-center px-3">
      <div className="pointer-events-auto flex items-center gap-1.5 rounded-2xl border border-slate-300/80 bg-white/85 px-2.5 py-2 shadow-2xl backdrop-blur-2xl dark:border-white/15 dark:bg-[#0d0d20]/85">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item);

          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setActiveSection(item.id)}
              title={item.label}
              className={`group relative flex flex-col items-center justify-center rounded-xl p-2.5 transition-all duration-200 ${
                isActive
                  ? `bg-gradient-to-br ${item.accent} text-white shadow-lg -translate-y-1 scale-105`
                  : 'text-slate-600 hover:-translate-y-0.5 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-white/10'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="mt-0.5 text-[9px] font-semibold sm:hidden">
                {item.shortLabel}
              </span>
              {isActive && (
                <span className="absolute -bottom-1.5 hidden h-1 w-1 rounded-full bg-violet-400 sm:block" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomDock;
