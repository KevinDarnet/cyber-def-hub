import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Moon,
  Sun,
  Timer,
  User,
  LogOut,
  Sparkles,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';

const TopBar = ({ onOpenMobileMenu, onOpenAuth }) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const {
    pomodoro,
    setActiveSection,
  } = useAppData();
  const {
    currentUser,
    userProfile,
    logout,
    updateUserDisplayName,
    isFirebaseConfigured,
  } = useAuth();
  const [now, setNow] = useState(new Date());
  const [isEditingName, setIsEditingName] = useState(false);
  const [customNameInput, setCustomNameInput] = useState('');
  const [clockFormat, setClockFormat] = useState(() => {
    try {
      return localStorage.getItem('cyberdef_clock_format') || '24h';
    } catch {
      return '24h';
    }
  });

  const toggleClockFormat = () => {
    const nextFormat = clockFormat === '24h' ? '12h' : '24h';
    setClockFormat(nextFormat);
    try {
      localStorage.setItem('cyberdef_clock_format', nextFormat);
    } catch (e) {
      console.warn('Error guardando preferencia de reloj:', e);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = now.getHours();
  const greeting =
    hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  // Reloj en formato 24h por defecto, o 12h con AM/PM al alternar
  const formattedTime =
    clockFormat === '24h'
      ? now.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      : now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

  const formattedDate = now.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const pomoMinutes = String(Math.floor(pomodoro.secondsLeft / 60)).padStart(2, '0');
  const pomoSeconds = String(pomodoro.secondsLeft % 60).padStart(2, '0');

  const getInitialName = () => {
    if (currentUser?.displayName && currentUser.displayName.trim() !== '') {
      return currentUser.displayName;
    }
    if (userProfile?.displayName && userProfile.displayName.trim() !== '') {
      return userProfile.displayName;
    }
    if (currentUser?.email) {
      const prefix = currentUser.email.split('@')[0].replace(/[._-]/g, ' ');
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return 'Estudiante';
  };

  const studentDisplayName = getInitialName();

  const handleSaveName = (e) => {
    e?.preventDefault();
    if (customNameInput.trim()) {
      updateUserDisplayName(customNameInput.trim());
    }
    setIsEditingName(false);
  };

  return (
    <header className="glass-card mb-5 flex flex-wrap items-center justify-between gap-4 px-5 py-4">
      {/* Left: Mobile Trigger + Greeting */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-slate-700 hover:bg-slate-200 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/10 lg:hidden"
          aria-label="Abrir navegación"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl flex items-center flex-wrap gap-1.5">
            <span>{greeting},</span>{' '}
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="inline-flex items-center gap-1.5">
                <input
                  type="text"
                  autoFocus
                  value={customNameInput}
                  onChange={(e) => setCustomNameInput(e.target.value)}
                  className="rounded-lg border border-violet-500 bg-slate-900/90 px-2 py-0.5 text-base font-extrabold text-white outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="Tu nombre..."
                />
                <button
                  type="submit"
                  className="rounded-md bg-violet-600 p-1 text-white hover:bg-violet-500"
                  title="Guardar nombre"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="rounded-md bg-slate-700 p-1 text-slate-300 hover:bg-slate-600"
                  title="Cancelar"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <span
                onClick={() => {
                  setCustomNameInput(studentDisplayName);
                  setIsEditingName(true);
                }}
                title="Haz clic para personalizar tu nombre"
                className="group inline-flex items-center gap-1.5 cursor-pointer rounded-lg px-1.5 py-0.5 hover:bg-violet-500/10 transition-colors"
              >
                <span className="bg-gradient-to-r from-violet-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {studentDisplayName}
                </span>
                <span className="text-slate-900 dark:text-white">.</span>
                <span className="inline-block">👋</span>
                <Pencil className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            )}
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
            CyberDefHub • {userProfile?.career?.name || userProfile?.careerConfig?.name || 'Carrera Universitaria'} • {userProfile?.career?.institution || userProfile?.careerConfig?.institution || 'Universidad'}
          </p>
        </div>
      </div>

      {/* Right: User Chip, Pomodoro, Backup Button, Theme & Clock */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {/* Live Pomodoro Indicator when running */}
        {pomodoro.isRunning && (
          <button
            onClick={() => {
              setActiveSection('focus');
              navigate('/focus');
            }}
            className="flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/15 px-3 py-1.5 text-xs font-mono font-semibold text-violet-700 shadow-neon-purple dark:text-violet-300"
          >
            <Timer className="h-3.5 w-3.5 animate-pulse" />
            <span>
              {pomoMinutes}:{pomoSeconds}
            </span>
          </button>
        )}

        {/* User Status / Login Pill */}
        {currentUser ? (
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={studentDisplayName}
                className="h-5 w-5 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
            <span className="max-w-[130px] truncate">{studentDisplayName}</span>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="ml-1 text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-500/25 dark:text-violet-300 transition-colors"
          >
            <User className="h-3.5 w-3.5" />
            <span>Acceder</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-xl border border-slate-200/80 bg-slate-100/70 p-2 text-slate-700 transition hover:border-violet-400/50 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-white"
          aria-label="Cambiar tema"
          title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
        >
          {theme === 'dark' ? (
            <Moon className="h-4 w-4 text-violet-400" />
          ) : (
            <Sun className="h-4 w-4 text-amber-500" />
          )}
        </button>

        {/* System Time and Date (Click to toggle 24h / 12h) */}
        <div className="hidden text-right md:block select-none">
          <button
            type="button"
            onClick={toggleClockFormat}
            className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 font-mono text-base font-bold tracking-tight text-slate-900 transition hover:bg-violet-500/10 hover:text-violet-400 dark:text-white dark:hover:text-cyan-300"
            title={`Formato actual: ${clockFormat}. Haz clic para cambiar a ${clockFormat === '24h' ? '12h (con AM/PM)' : '24 horas'}`}
          >
            <span>{formattedTime}</span>
            <span className="rounded bg-violet-500/15 px-1 py-0.5 font-mono text-[9px] font-bold uppercase text-violet-400 opacity-70 group-hover:opacity-100 transition-opacity">
              {clockFormat}
            </span>
          </button>
          <p className="text-[11px] font-medium capitalize text-slate-500 dark:text-slate-400">
            {formattedDate}
          </p>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
