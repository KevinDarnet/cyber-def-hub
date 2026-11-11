import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Shield,
  Mail,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const navigate = useNavigate();
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    isFirebaseConfigured,
  } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mantener el modo sincronizado cuando se abre con initialMode
  React.useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isFirebaseConfigured) {
      setError(
        'Firebase no está configurado en el archivo .env. Agrega VITE_FIREBASE_API_KEY y VITE_FIREBASE_PROJECT_ID para habilitar la autenticación real.'
      );
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email.trim(), password);
      } else {
        const nameToUse = displayName.trim() || email.split('@')[0].replace(/[._-]/g, ' ');
        const cap = nameToUse.charAt(0).toUpperCase() + nameToUse.slice(1);
        await registerWithEmail(email.trim(), password, cap);
      }
      if (onClose) onClose();
      navigate('/dashboard');
    } catch (err) {
      let friendlyMsg = err.message;
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        friendlyMsg = 'Credenciales inválidas. Verifica tu correo y contraseña.';
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyMsg = 'Este correo electrónico ya se encuentra registrado. Inicia sesión.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyMsg = 'Formato de correo electrónico no válido.';
      }
      setError(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);

    if (!isFirebaseConfigured) {
      setError(
        'Firebase no está configurado en el archivo .env. Agrega las claves de tu proyecto para habilitar Google Authentication.'
      );
      return;
    }

    setLoading(true);
    try {
      await loginWithGoogle();
      if (onClose) onClose();
      navigate('/dashboard');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Error al conectar con Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 overscroll-contain">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="glass-card relative z-10 w-full max-w-md max-h-[92vh] max-h-[92dvh] overflow-y-auto overscroll-contain border border-violet-500/40 p-6 sm:p-7 shadow-2xl">
        {/* Botón cerrar modal */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/50 hover:text-slate-800 dark:hover:bg-white/10 dark:hover:text-white transition"
          aria-label="Cerrar ventana"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Encabezado con estética Ciberdefensa */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-500 text-white shadow-neon-purple">
            <GraduationCap className="h-7 w-7" />
          </div>
          <span className="inline-block rounded-full bg-violet-500/15 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-400 mb-1">
            Gestión Académica Universitaria
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            CyberDefHub <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Portal</span>
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login'
              ? 'Inicia sesión para sincronizar tu plan de estudios y resúmenes'
              : 'Registra tu perfil para dar seguimiento a tu carrera universitaria'}
          </p>
        </div>

        {/* Notificación si Firebase no tiene credenciales en .env */}
        {!isFirebaseConfigured && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
            <div>
              <p className="font-semibold">Configuración de Firebase requerida</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                Ingresa las variables de entorno de tu proyecto en el archivo <code className="rounded bg-black/20 px-1 py-0.5 font-mono">.env</code> para habilitar la autenticación real con Google o Correo/Contraseña.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/15 p-3 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Botón de Google OAuth */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300/80 bg-white py-2.5 text-xs font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10 disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
              />
            </svg>
            <span>
              {mode === 'login'
                ? 'Continuar con Google'
                : 'Registrarme con cuenta de Google'}
            </span>
          </button>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300/60 dark:border-white/10" />
            </div>
            <span className="relative bg-white px-2.5 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-[#111126] dark:text-slate-400">
              o con usuario institucional y contraseña
            </span>
          </div>
        </div>

        {/* Formulario Email / Contraseña */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nombre y Apellido
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tu nombre o apodo (ej. Kevin, Alex)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="os-input pl-9 text-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="cadete@fadena.undef.edu.ar"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="os-input pl-9 text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="os-input pl-9 text-xs"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="os-btn-primary w-full py-2.5 text-xs font-bold disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Conectando con CyberDefHub...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>
                  {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta Académica'}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            )}
          </button>
        </form>

        {/* Selector de modo Login / Register */}
        <div className="mt-5 border-t border-slate-200/60 pt-4 text-center text-xs dark:border-white/10">
          {mode === 'login' ? (
            <p className="text-slate-500 dark:text-slate-400">
              ¿No tienes una cuenta académica?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="font-bold text-violet-600 hover:text-violet-500 dark:text-violet-400"
              >
                Regístrate aquí
              </button>
            </p>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">
              ¿Ya tienes cuenta registrada?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="font-bold text-violet-600 hover:text-violet-500 dark:text-violet-400"
              >
                Inicia sesión aquí
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
