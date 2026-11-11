import React, { useState } from 'react';
import {
  Shield,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Building,
  BookOpen,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_CAREER_TEMPLATE } from '../../services/db';
import { getInitialSubjects } from '../../data/seedData';

const OnboardingModal = ({ isOpen, onClose }) => {
  const {
    completeOnboarding,
    currentUser,
    needsOnboarding,
    hasCareerConfigured,
    isAuthLoading,
    isProfileLoading,
  } = useAuth();

  const [step, setStep] = useState('choice'); // 'choice' | 'custom'
  const [careerName, setCareerName] = useState('');
  const [institution, setInstitution] = useState('');
  const [loading, setLoading] = useState(false);

  // Guard estricto: Si la app está cargando, o el usuario ya tiene carrera configurada, o no está abierto, NUNCA renderizar
  if (!isOpen || !needsOnboarding || hasCareerConfigured || isAuthLoading || isProfileLoading) {
    return null;
  }

  // Opción 1: Plantilla Modelo Ciberdefensa (FADENA / UNDEF)
  const handleSelectDefaultTemplate = async () => {
    setLoading(true);
    try {
      const ciberSubjects = getInitialSubjects();
      await completeOnboarding(DEFAULT_CAREER_TEMPLATE, ciberSubjects);
      if (onClose) onClose();
    } catch (err) {
      alert('Error guardando la configuración: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Opción 2: Comenzar desde Cero (Personalizado 100% en blanco)
  const handleSaveCustomCareer = async (e) => {
    e.preventDefault();
    if (!careerName.trim()) return;

    setLoading(true);
    try {
      const customCareer = {
        id: `custom-${Date.now()}`,
        name: careerName.trim(),
        institution: institution.trim() || 'Universidad',
        degreeType: 'Grado Universitario',
        totalHours: 0,
        intermediateTitle: 'Ciclo Básico',
        isCustom: true,
      };

      // Inicializa 100% en blanco (sin materias, sin notas, sin áreas fijas)
      await completeOnboarding(customCareer, []);
      if (onClose) onClose();
    } catch (err) {
      alert('Error guardando la carrera personalizada: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4 overscroll-contain">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-lg" />

      <div className="glass-card relative z-10 w-full max-w-2xl max-h-[92vh] max-h-[92dvh] overflow-y-auto overscroll-contain border border-violet-500/50 p-6 sm:p-8">
        {onClose && !needsOnboarding && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/50 hover:text-slate-800 dark:hover:bg-white/10 dark:hover:text-white transition"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {step === 'choice' ? (
          <div>
            <div className="mb-8 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-violet-400">
                <Sparkles className="h-3.5 w-3.5" /> Configura tu Carrera
              </span>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
                ¡Bienvenido a CyberDefHub{currentUser?.displayName ? `, ${currentUser.displayName}` : ''}!
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                Tu espacio de gestión académica y técnica. Elige una plantilla especializada para Ciberdefensa o configura tu carrera desde cero para cualquier universidad.
              </p>
            </div>

            {/* Dos Opciones Centradas */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Opción 1 (Destacada / Recomendada): Plantilla Modelo Ciberdefensa */}
              <div
                onClick={!loading ? handleSelectDefaultTemplate : undefined}
                className="group glass-subcard relative flex cursor-pointer flex-col justify-between border-2 border-violet-500/40 p-5 transition-all hover:border-violet-500 hover:shadow-neon-purple text-left"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md">
                      <Shield className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-[10px] font-bold text-violet-300 uppercase tracking-wider">
                      Destacada / Recomendada
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-bold text-violet-400">
                      FADENA / UNDEF
                    </span>
                  </div>

                  <h3 className="mt-1.5 text-base font-extrabold text-slate-900 dark:text-white">
                    Plantilla Modelo Ciberdefensa
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Viene con el plan de estudios, correlatividades y áreas de especialización precargadas (37 asignaturas oficiales).
                  </p>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  className="os-btn-primary mt-6 w-full py-2.5 text-xs font-bold"
                >
                  {loading ? (
                    'Cargando...'
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      <span>Cargar Plantilla Ciberdefensa</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              </div>

              {/* Opción 2: Personalizado / Otra Universidad o Carrera */}
              <div
                onClick={() => setStep('custom')}
                className="group glass-subcard flex cursor-pointer flex-col justify-between border-2 border-transparent p-5 transition-all hover:border-cyan-500/70 hover:shadow-neon-cyan text-left"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-md">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-400">
                      100% Flexible
                    </span>
                  </div>

                  <h3 className="mt-1.5 text-base font-extrabold text-slate-900 dark:text-white">
                    Personalizado / Otra Universidad o Carrera
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Inicia tu plan académico 100% en blanco adaptado a tu plan de estudios y casa de estudios.
                  </p>
                </div>

                <button
                  type="button"
                  className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/15 py-2.5 text-xs font-bold text-cyan-700 transition hover:bg-cyan-500/25 dark:text-cyan-300"
                >
                  <span>Configurar desde Cero</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Formulario: Comenzar desde Cero */
          <form onSubmit={handleSaveCustomCareer} className="space-y-5">
            <div>
              <button
                type="button"
                onClick={() => setStep('choice')}
                className="mb-2 text-xs font-semibold text-violet-400 hover:underline inline-flex items-center gap-1"
              >
                ← Volver a opciones
              </button>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Personalizado / Otra Universidad o Carrera
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Ingresa los datos de tu carrera universitaria. Se inicializará un espacio limpio para que cargues tus materias a tu ritmo.
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nombre de la Carrera *
                </label>
                <div className="relative">
                  <GraduationCap className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ej: Ingeniería Informática, Lic. en Sistemas, Telecomunicaciones..."
                    value={careerName}
                    onChange={(e) => setCareerName(e.target.value)}
                    className="os-input pl-9 text-xs"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Institución o Universidad *
                </label>
                <div className="relative">
                  <Building className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ej: UBA, UTN, UNLP, ITBA, UNC, etc."
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="os-input pl-9 text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/60 dark:border-white/10">
              <button
                type="button"
                onClick={() => setStep('choice')}
                className="os-btn-ghost px-4 py-2 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !careerName.trim()}
                className="os-btn-primary px-5 py-2 text-xs font-bold disabled:opacity-50"
              >
                {loading ? 'Inicializando...' : 'Inicializar Espacio en Blanco'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
