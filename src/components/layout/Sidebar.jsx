import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  GraduationCap,
  Calendar,
  CheckSquare,
  Timer,
  StickyNote,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Shield,
  X,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';

const StudyIsotype = ({ className = 'h-5 w-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 6.25C9.6 4.7 5.8 4.7 3.5 6V18.8C5.8 17.5 9.6 17.5 12 19.1V6.25Z"
      fill="currentColor"
      fillOpacity="0.25"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 6.25C14.4 4.7 18.2 4.7 20.5 6V18.8C18.2 17.5 14.4 17.5 12 19.1V6.25Z"
      fill="currentColor"
      fillOpacity="0.4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 6.25V19.1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const NAV_ITEMS = [
  {
    id: 'dashboard',
    path: '/dashboard',
    label: 'Dashboard OS',
    shortLabel: 'Inicio',
    icon: Home,
    accent: 'from-violet-500 to-purple-600',
  },
  {
    id: 'academic',
    path: '/plan',
    label: 'Carrera / Plan',
    shortLabel: 'Carrera',
    icon: GraduationCap,
    accent: 'from-indigo-500 to-violet-600',
  },
  {
    id: 'summaries',
    path: '/resumenes',
    label: 'Artículos & Resúmenes',
    shortLabel: 'Artículos',
    icon: BookOpen,
    accent: 'from-fuchsia-500 to-pink-600',
  },
  {
    id: 'calendar',
    path: '/agenda',
    label: 'Calendario & Agenda',
    shortLabel: 'Agenda',
    icon: Calendar,
    accent: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'tasks',
    path: '/tareas',
    label: 'Gestor de Tareas',
    shortLabel: 'Tareas',
    icon: CheckSquare,
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'focus',
    path: '/focus',
    label: 'Focus & Hábitos',
    shortLabel: 'Focus',
    icon: Timer,
    accent: 'from-rose-500 to-pink-600',
  },
  {
    id: 'notes',
    path: '/notas',
    label: 'Notas Rápidas',
    shortLabel: 'Notas',
    icon: StickyNote,
    accent: 'from-amber-500 to-orange-600',
  },
];

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen, onOpenAuth }) => {
  const location = useLocation();
  const { tasks, academicStats, setActiveSection } = useAppData();
  const { currentUser, userProfile, logout, isGuestMode } = useAuth();

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completado').length;

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

  const renderContent = (isMobile = false) => {
    const isExpanded = isMobile || !collapsed;

    return (
      <div className="flex min-h-full flex-col justify-between p-3.5">
        {/* Brand & Navigation */}
        <div>
          {/* Mobile Close Button */}
          {isMobile && (
            <div className="mb-3 flex justify-end">
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-white/10 transition"
                aria-label="Cerrar menú"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* App Identity */}
          <div
            className={`mb-5 flex items-center gap-3 rounded-2xl p-2 transition-all ${
              isExpanded
                ? 'bg-violet-500/10 border border-violet-500/20'
                : 'justify-center'
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-neon-purple">
              <StudyIsotype className="h-5 w-5 text-white" />
            </div>
            {isExpanded && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                  CyberDefHub
                </p>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {userProfile?.career?.name || userProfile?.careerConfig?.name || 'Carrera Universitaria'} • {academicStats.progressPct}%
                </p>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item);

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileOpen(false);
                  }}
                  title={!isExpanded ? item.label : undefined}
                  className={`group relative flex w-full items-center rounded-xl transition-all duration-200 ${
                    isExpanded ? 'gap-3 px-3 py-2.5' : 'justify-center p-3'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-neon-purple'
                      : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {isExpanded && (
                    <span className="flex-1 text-left text-sm font-medium">
                      {item.label}
                    </span>
                  )}

                  {item.id === 'tasks' && pendingTasksCount > 0 && (
                    <span
                      className={`${
                        isExpanded
                          ? 'px-2 py-0.5 text-[11px]'
                          : 'absolute -right-0.5 -top-0.5 h-4 w-4 text-[10px]'
                      } flex items-center justify-center rounded-full font-semibold ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-violet-500/20 text-violet-700 dark:text-violet-300'
                      }`}
                    >
                      {pendingTasksCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: User Profile Chip + Progress + Collapse Toggle */}
        <div className="space-y-3 pt-3">
          {/* User Profile Card */}
          {currentUser ? (
            <div
              className={`glass-subcard flex items-center ${
                isExpanded ? 'justify-between p-2.5' : 'justify-center p-2'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Usuario'}
                    className="h-8 w-8 rounded-full border border-violet-500/40 object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-violet-400">
                    <User className="h-4 w-4" />
                  </div>
                )}
                {isExpanded && (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                      {currentUser.displayName || userProfile?.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Estudiante')}
                    </p>
                    <p className="truncate text-[10px] text-slate-400">
                      {currentUser.email}
                    </p>
                  </div>
                )}
              </div>

              {isExpanded && (
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/15 hover:text-rose-500"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            isExpanded && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/15 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-500/25 dark:text-violet-300"
              >
                <User className="h-3.5 w-3.5" />
                <span>Iniciar Sesión / Registro</span>
              </button>
            )
          )}

          {isExpanded && (
            <div className="glass-subcard p-3">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  Progreso Carrera
                </span>
                <span className="font-mono font-semibold text-violet-600 dark:text-violet-400">
                  {academicStats.approvedCount}/{academicStats.total}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${academicStats.progressPct}%` }}
                />
              </div>
            </div>
          )}

          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-slate-100/70 py-2 text-xs font-medium text-slate-600 transition hover:border-violet-400/50 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white"
              title={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4" />
                  <span>Colapsar panel</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <aside
        className={`sticky top-3 sm:top-4 lg:top-5 z-30 hidden lg:block shrink-0 transition-all duration-300 ease-out h-[calc(100vh-1.5rem)] lg:h-[calc(100dvh-2.5rem)] ${
          collapsed ? 'w-[84px]' : 'w-64'
        }`}
      >
        <div className="glass-card flex h-full flex-col overflow-y-auto overscroll-contain">
          {renderContent(false)}
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden overscroll-contain">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 h-full w-72 p-3">
            <div className="glass-card h-full overflow-y-auto overscroll-contain">{renderContent(true)}</div>
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
