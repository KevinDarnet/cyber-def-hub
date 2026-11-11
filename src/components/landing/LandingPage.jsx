import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Terminal,
  BookOpen,
  Calendar,
  CheckSquare,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  Shield,
  FileText,
  BarChart3,
  Award,
  ChevronRight,
  User,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const LandingPage = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  const { isFirebaseConfigured } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleAuth = (mode = 'login') => {
    if (onOpenAuth) {
      onOpenAuth(mode);
    } else {
      navigate(`/login?mode=${mode}`);
    }
  };

  const studyModules = [
    {
      icon: Layers,
      title: 'Plan de Estudios Dinámico y Malla Curricular',
      desc: 'Visualiza tu carrera por años, cuatrimestres o semestres. Controla materias aprobadas, en curso y pendientes con indicadores de progreso visual.',
      tag: 'Estructura Curricular',
      accent: 'from-violet-500 to-purple-600',
    },
    {
      icon: Award,
      title: 'Gestor de Correlatividades y Promedio Automático',
      desc: 'Mapeo inteligente de requisitos previos para cursar o rendir finales. Cálculo automático de promedio ponderado, horas aprobadas y títulos intermedios.',
      tag: 'Rendimiento',
      accent: 'from-cyan-500 to-blue-600',
    },
    {
      icon: FileText,
      title: 'Artículos, Apuntes y Resúmenes Técnicos en Markdown',
      desc: 'Editor para textos largos de estudio con soporte de bloques de código, listas, citas, etiquetas por asignatura y exportación a archivos .md.',
      tag: 'Conocimiento',
      accent: 'from-fuchsia-500 to-pink-600',
    },
    {
      icon: CheckSquare,
      title: 'Agenda de Exámenes y Tareas Kanban',
      desc: 'Organizador de entregas, trabajos prácticos y fechas clave de parciales y finales con estados dinámicos (Pendiente, En Progreso, Completado).',
      tag: 'Productividad',
      accent: 'from-amber-500 to-orange-600',
    },
    {
      icon: Clock,
      title: 'Control de Asistencia y Horas Cursadas',
      desc: 'Temporizador Pomodoro integrado con sesiones de concentración y descansos, además de seguimiento de hábitos de estudio diarios.',
      tag: 'Enfoque & Hábitos',
      accent: 'from-emerald-500 to-teal-600',
    },
  ];

  const templatesPreview = [
    {
      name: 'Licenciatura en Ciberdefensa',
      institution: 'FADENA / UNDEF (Plantilla Oficial)',
      specs: '37 asignaturas • 2624 hs • Títulos de Grado e Intermedio',
      badge: 'Plantilla Destacada',
    },
    {
      name: 'Ingeniería / Carreras Técnicas',
      institution: 'Formato Semestral Universal (10 Semestres)',
      specs: 'Cálculo, Redes, Sistemas Operativos y Proyectos Técnicos',
      badge: 'Formato Semestral',
    },
    {
      name: 'Personalizado / Cualquier Universidad',
      institution: 'Cualquier Universidad / Instituto',
      specs: 'Inicia 100% en blanco: agrega tus materias, correlatividades y áreas a tu medida',
      badge: '100% Flexible',
    },
  ];

  return (
    <div className="os-backdrop min-h-screen min-h-[100dvh] w-full">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/60 backdrop-blur-xl dark:border-white/10 dark:bg-[#070715]/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-500 text-white shadow-neon-purple">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="flex items-center gap-2 text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                CyberDefHub
                <span className="rounded-full bg-violet-500/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-violet-400">
                  Ciberdefensa & Academia
                </span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Gestión Académica Universitaria y Especialización Técnica
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleAuth('login')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-xs font-bold text-violet-700 shadow-sm transition-all hover:bg-violet-500/20 dark:text-violet-300"
            >
              <User className="h-3.5 w-3.5" />
              <span>Ingresar</span>
            </button>

            <button
              onClick={() => handleAuth('register')}
              className="os-btn-primary px-4 py-2 text-xs font-bold"
            >
              <span>Registrarse</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-violet-700 shadow-neon-purple dark:text-violet-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Especialización en Ciberdefensa • Adaptable a Cualquier Universidad</span>
          </div>

          <h1 className="text-3xl font-black leading-[1.15] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Tu Estación Integral de{' '}
            <span className="bg-gradient-to-r from-violet-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Ciberdefensa & Estudio Superior
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
            Plataforma de alto rendimiento enfocada en la formación de ciberdefensa y seguridad de la información, con arquitectura modular adaptable a cualquier carrera universitaria o técnica. Malla curricular, correlatividades, apuntes en Markdown y tareas en un solo lugar.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => handleAuth('register')}
              className="os-btn-primary px-6 py-3 text-sm font-bold shadow-neon-purple"
            >
              <span>Comenzar Ahora</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => handleAuth('login')}
              className="os-btn-ghost rounded-xl border border-slate-300 bg-white/40 px-5 py-3 text-sm font-semibold dark:border-white/10 dark:bg-white/[0.04]"
            >
              Acceder con mi Cuenta
            </button>
          </div>
        </div>

        {/* Módulos del Sistema de Estudio */}
        <div className="mt-20">
          <div className="mb-10 text-center">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400">
              Arquitectura de Estudio
            </span>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
              Módulos del Sistema de Estudio
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              Herramientas de alto rendimiento concebidas para simplificar la vida académica, el seguimiento de materias y la concentración diaria.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {studyModules.map((module, i) => {
              const Icon = module.icon;
              return (
                <div
                  key={i}
                  className="glass-card flex flex-col justify-between p-6 transition-all duration-300 hover:border-violet-500/50 hover:shadow-neon-purple"
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${module.accent} text-white shadow-md`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                        {module.tag}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {module.title}
                    </h3>

                    <p className="mt-2.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
                      {module.desc}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-slate-200/60 pt-3 dark:border-white/10">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400">
                      <span>Disponible en CyberDefHub</span>
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sección de Plantillas Universitarias */}
        <div className="mt-20 glass-card p-6 sm:p-10">
          <div className="mb-8 text-center sm:text-left">
            <span className="rounded-full bg-cyan-500/15 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Ciberdefensa + Flexibilidad Universitaria
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
              Especializado en Ciberseguridad, Abierto a Toda Carrera
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              Carga la plantilla oficial de Ciberdefensa (FADENA / UNDEF) o configura desde cero tu plan de estudios para cualquier universidad:
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {templatesPreview.map((tmpl, idx) => (
              <div
                key={idx}
                className="glass-subcard flex flex-col justify-between p-4 border border-violet-500/20"
              >
                <div>
                  <span className="inline-block rounded-md bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-300 mb-2">
                    {tmpl.badge}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {tmpl.name}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                    {tmpl.institution}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {tmpl.specs}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <footer className="mt-16 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-white/10 pt-8">
          <p className="font-semibold">
            © CyberDefHub • Plataforma de Gestión Académica y Formación Técnica en Ciberdefensa.
          </p>
          <p className="mt-1 text-[11px]">
            Diseñada para cadetes, estudiantes universitarios y profesionales de la seguridad informática. Adaptable a cualquier plan de estudios.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
