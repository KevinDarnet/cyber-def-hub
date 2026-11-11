import React, { useMemo, useState } from 'react';
import {
  Shield,
  Globe,
  Sigma,
  Network,
  Code2,
  BookOpen,
  Search,
  Github,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Clock,
  Lock,
  CheckCircle2,
  Award,
  ArrowRight,
  Plus,
  GraduationCap,
  X,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';

export const CATEGORY_META = {
  Ciberseguridad: {
    label: 'Ciberseguridad',
    subtitle: 'SGSI, Forense, Criptografía, OT & Riesgos TIC',
    icon: Shield,
    badge: 'bg-violet-500/15 text-violet-700 border-violet-500/30 dark:text-violet-300',
    accent: 'from-violet-500 to-purple-600',
  },
  Ciberdefensa: {
    label: 'Ciberdefensa',
    subtitle: 'Infraestructuras Críticas, Quinto Dominio, Inteligencia & Defensa',
    icon: Globe,
    badge: 'bg-rose-500/15 text-rose-700 border-rose-500/30 dark:text-rose-300',
    accent: 'from-rose-500 to-pink-600',
  },
  Matemáticas: {
    label: 'Matemáticas (Cálculo & Álgebra)',
    subtitle: 'Análisis Matemático, Álgebra Lineal, Probabilidad e Inv. Operativa',
    icon: Sigma,
    badge: 'bg-cyan-500/15 text-cyan-700 border-cyan-500/30 dark:text-cyan-300',
    accent: 'from-cyan-500 to-blue-600',
  },
  'Redes y Sistemas': {
    label: 'Redes y Sistemas Operativos',
    subtitle: 'Telecomunicaciones, Sistemas Operativos I/II & Dispositivos IoT',
    icon: Network,
    badge: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300',
    accent: 'from-emerald-500 to-teal-600',
  },
  Programación: {
    label: 'Programación, Datos e IA',
    subtitle: 'Lenguajes, Tratamiento de Datos, Programación Segura, IA & Simulación',
    icon: Code2,
    badge: 'bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300',
    accent: 'from-amber-500 to-orange-600',
  },
  'Gestión y General': {
    label: 'Gestión, Idiomas y Ética',
    subtitle: 'Servicios de Información, Inglés Técnico, Ética y Proyectos',
    icon: BookOpen,
    badge: 'bg-indigo-500/15 text-indigo-700 border-indigo-500/30 dark:text-indigo-300',
    accent: 'from-indigo-500 to-blue-600',
  },
};

const YEAR_TABS = [
  { id: 0, label: 'Curso Introductorio', sub: '3 Materias · Nivelación Universitaria' },
  { id: 1, label: 'Primer Año', sub: '10 Materias • Ciclo Básico' },
  { id: 2, label: 'Segundo Año', sub: '9 Materias • Ciclo Básico' },
  { id: 3, label: 'Tercer Año', sub: '9 Materias • Título Intermedio + Avanzado' },
  { id: 4, label: 'Cuarto Año', sub: '9 Materias • Ciclo Avanzado' },
  { id: 'all', label: 'Malla Completa', sub: '37 Materias • 2624 hs' },
];

const STATUS_STYLES = {
  pendiente: 'bg-slate-200/80 text-slate-700 dark:bg-white/10 dark:text-slate-300',
  cursando: 'bg-cyan-500/15 text-cyan-700 border border-cyan-500/30 dark:text-cyan-300',
  regular: 'bg-amber-500/15 text-amber-700 border border-amber-500/30 dark:text-amber-300',
  aprobada: 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 dark:text-emerald-300',
};

const AcademicHubView = () => {
  const {
    subjects,
    academicStats,
    updateSubject,
    createSubject,
    setSelectedSubjectId,
  } = useAppData();
  const { userProfile } = useAuth();

  const resolvedCareer = userProfile?.career || userProfile?.careerConfig;
  const isCustomCareer = Boolean(resolvedCareer?.isCustom);
  const careerName = resolvedCareer?.name || 'Carrera Universitaria';
  const institutionName = resolvedCareer?.institution || 'Universidad';
  const totalHours = resolvedCareer?.totalHours || academicStats.totalDegreeHours || 2400;
  const intermediateTitle = resolvedCareer?.intermediateTitle || 'Ciclo Básico / Intermedio';

  const [selectedYear, setSelectedYear] = useState(isCustomCareer ? 'all' : 1);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjYear, setNewSubjYear] = useState(1);
  const [newSubjSemester, setNewSubjSemester] = useState(1);
  const [newSubjCategory, setNewSubjCategory] = useState('');

  const yearTabs = useMemo(() => {
    if (!isCustomCareer) {
      return YEAR_TABS;
    }
    return [
      { id: 1, label: 'Primer Año', sub: 'Año 1' },
      { id: 2, label: 'Segundo Año', sub: 'Año 2' },
      { id: 3, label: 'Tercer Año', sub: 'Año 3' },
      { id: 4, label: 'Cuarto Año', sub: 'Año 4' },
      { id: 5, label: 'Quinto Año', sub: 'Año 5' },
      { id: 'all', label: 'Malla Completa', sub: `${subjects.length} materias` },
    ];
  }, [isCustomCareer, subjects.length]);

  const availableCategories = useMemo(() => {
    if (!isCustomCareer) {
      return Object.keys(CATEGORY_META);
    }
    const set = new Set(subjects.map((s) => s.category).filter(Boolean));
    return Array.from(set);
  }, [isCustomCareer, subjects]);

  const approvedCodes = useMemo(
    () => new Set(subjects.filter((s) => s.status === 'aprobada').map((s) => s.code)),
    [subjects]
  );

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subj) => {
      if (selectedYear !== 'all' && subj.year !== selectedYear) return false;
      if (selectedCategory !== 'Todas' && subj.category !== selectedCategory) return false;
      if (statusFilter !== 'todos' && subj.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = subj.name?.toLowerCase().includes(q);
        const matchCode = String(subj.code) === q;
        const matchCat = subj.category?.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchCat) return false;
      }
      return true;
    });
  }, [subjects, selectedYear, selectedCategory, statusFilter, searchQuery]);

  // Group filtered subjects by category sub-sections
  const groupedByCategory = useMemo(() => {
    const groups = [];
    const usedCategories = new Set();

    if (!isCustomCareer) {
      Object.keys(CATEGORY_META).forEach((catKey) => {
        const items = filteredSubjects.filter((s) => s.category === catKey);
        if (items.length > 0) {
          usedCategories.add(catKey);
          groups.push({
            category: catKey,
            meta: CATEGORY_META[catKey],
            items,
          });
        }
      });
    }

    filteredSubjects.forEach((s) => {
      const cat = s.category || 'General';
      if (!usedCategories.has(cat)) {
        usedCategories.add(cat);
        const items = filteredSubjects.filter((item) => (item.category || 'General') === cat);
        groups.push({
          category: cat,
          meta: CATEGORY_META[cat] || {
            label: cat,
            subtitle: 'Área Académica',
            icon: BookOpen,
            badge: 'bg-violet-500/15 text-violet-700 border-violet-500/30 dark:text-violet-300',
            accent: 'from-violet-500 to-purple-600',
          },
          items,
        });
      }
    });

    return groups;
  }, [filteredSubjects, isCustomCareer]);

  const handleCreateNewSubject = (e) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;
    createSubject({
      name: newSubjName.trim(),
      year: Number(newSubjYear) || 1,
      semester: Number(newSubjSemester) || 1,
      category: newSubjCategory.trim() || 'General',
    });
    setNewSubjName('');
    setNewSubjCategory('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* Top Career Banner */}
      <div className="glass-card p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-bold text-violet-700 dark:text-violet-300">
                {institutionName} • Plan de Estudios
              </span>
              <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                {totalHours} Horas Totales
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {careerName}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              Título Intermedio / Ciclo Básico:{' '}
              <strong className="text-slate-700 dark:text-slate-200">
                {intermediateTitle}
              </strong>
            </p>
          </div>

          {/* KPI Pills */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="glass-subcard px-3.5 py-2.5 text-center">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Aprobadas</p>
              <p className="font-mono text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                {academicStats.approvedCount}/{academicStats.total}
              </p>
            </div>
            <div className="glass-subcard px-3.5 py-2.5 text-center">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Cursando</p>
              <p className="font-mono text-lg font-extrabold text-cyan-600 dark:text-cyan-400">
                {academicStats.inProgressCount}
              </p>
            </div>
            <div className="glass-subcard px-3.5 py-2.5 text-center">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Promedio</p>
              <p className="font-mono text-lg font-extrabold text-violet-600 dark:text-violet-400">
                {academicStats.avgGrade}
              </p>
            </div>
            <div className="glass-subcard px-3.5 py-2.5 text-center">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Horas</p>
              <p className="font-mono text-lg font-extrabold text-slate-900 dark:text-white">
                {academicStats.totalHoursCompleted}h
              </p>
            </div>
          </div>
        </div>

        {/* Academic Year Tabs */}
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {yearTabs.map((yr) => {
            const active = selectedYear === yr.id;
            return (
              <button
                key={yr.id}
                onClick={() => setSelectedYear(yr.id)}
                className={`flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all ${
                  active
                    ? 'border-violet-500 bg-gradient-to-br from-violet-600/90 to-indigo-600/90 text-white shadow-neon-purple'
                    : 'border-slate-200/80 bg-slate-100/70 text-slate-700 hover:border-violet-400/50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200'
                }`}
              >
                <span className="text-sm font-bold">{yr.label}</span>
                <span
                  className={`mt-0.5 text-[11px] ${
                    active ? 'text-violet-100' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {yr.sub}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sub-section Area Filters + Search + Add Button */}
        <div className="mt-5 flex flex-col justify-between gap-3 border-t border-slate-200/70 pt-4 dark:border-white/[0.08] xl:flex-row xl:items-center">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCategory('Todas')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                selectedCategory === 'Todas'
                  ? 'bg-violet-600 text-white shadow-neon-purple'
                  : 'bg-slate-200/70 text-slate-600 hover:bg-slate-300/70 dark:bg-white/[0.06] dark:text-slate-300'
              }`}
            >
              Todas las Áreas
            </button>
            {availableCategories.map((catKey) => {
              const meta = CATEGORY_META[catKey];
              const Icon = meta ? meta.icon : BookOpen;
              const active = selectedCategory === catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? 'bg-violet-600 text-white shadow-neon-purple'
                      : 'bg-slate-200/70 text-slate-600 hover:bg-slate-300/70 dark:bg-white/[0.06] dark:text-slate-300'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{catKey}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar materia o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="os-input py-1.5 pl-8 text-xs"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="os-input w-auto py-1.5 text-xs"
            >
              <option value="todos">Estado: Todos</option>
              <option value="cursando">Cursando</option>
              <option value="aprobada">Aprobada</option>
              <option value="regular">Regular</option>
              <option value="pendiente">Pendiente</option>
            </select>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="os-btn-primary py-1.5 px-3 text-xs font-bold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nueva Materia</span>
            </button>
          </div>
        </div>
      </div>

      {/* Milestone Notice for Intro Course & 3rd Year */}
      {selectedYear === 0 && (
        <div className="glass-card flex items-center gap-3 border-violet-500/40 bg-violet-500/10 px-5 py-3.5 dark:border-violet-400/30">
          <BookOpen className="h-6 w-6 shrink-0 text-violet-400" />
          <p className="text-xs text-slate-700 dark:text-slate-200 sm:text-sm">
            <strong>Curso Introductorio e Ingreso:</strong> Instancia de nivelación universitaria y ambientación académica. Contiene las asignaturas base para consolidar lectura crítica, matemática y métodos de estudio universitario.
          </p>
        </div>
      )}

      {selectedYear === 3 && intermediateTitle && (
        <div className="glass-card flex items-center gap-3 border-amber-400/40 bg-amber-500/10 px-5 py-3.5 dark:border-amber-400/30">
          <Award className="h-6 w-6 shrink-0 text-amber-500" />
          <p className="text-xs text-slate-700 dark:text-slate-200 sm:text-sm">
            <strong>Hito del Ciclo Intermedio:</strong> Al completar este bloque
            avanzas hacia el ciclo superior y la certificación intermedia de{' '}
            <span className="font-bold text-amber-600 dark:text-amber-300">
              {intermediateTitle}
            </span>
            .
          </p>
        </div>
      )}

      {/* Grouped Sub-sections by Key Discipline */}
      {subjects.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-neon-purple">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Plan de Estudios en Blanco
          </h3>
          <p className="mx-auto mt-2 max-w-md text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Has configurado <strong>{careerName}</strong> ({institutionName}). Tu espacio está limpio y listo para que agregues tus asignaturas.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="os-btn-primary mt-6 px-5 py-2.5 text-xs font-bold shadow-neon-purple"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar mi Primera Materia</span>
          </button>
        </div>
      ) : groupedByCategory.length === 0 ? (
        <div className="glass-card p-12 text-center text-sm text-slate-500 dark:text-slate-400">
          No se encontraron materias con los filtros actuales.
        </div>
      ) : (
        groupedByCategory.map(({ category, meta, items }) => {
          const CatIcon = meta.icon;
          return (
            <section key={category} className="space-y-3">
              {/* Sub-section Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${meta.accent} text-white shadow-md`}
                  >
                    <CatIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {meta.label}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {meta.subtitle}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 font-mono text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                  {items.length} {items.length === 1 ? 'materia' : 'materias'}
                </span>
              </div>

              {/* Subject Cards Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((subj) => {
                  const allPrereqsMet =
                    !subj.prerequisites?.length ||
                    subj.prerequisites.every((code) => approvedCodes.has(code));

                  return (
                    <div
                      key={subj._id}
                      className="glass-card-hover flex flex-col justify-between p-4"
                    >
                      <div>
                        {/* Top row: Code + Semester + Quick Status Select */}
                        <div className="mb-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-lg bg-violet-600/15 px-2 py-0.5 font-mono text-xs font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                              #{subj.code}
                            </span>
                            <span className="rounded-lg bg-slate-200/70 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-white/[0.06] dark:text-slate-400">
                              {subj.year === 0 ? 'Nivelación' : `${subj.year}° Año • ${subj.semester}° Cuat.`}
                            </span>
                          </div>

                          <select
                            value={subj.status}
                            onChange={(e) =>
                              updateSubject(subj._id, { status: e.target.value })
                            }
                            aria-label={`Estado de ${subj.name}`}
                            className={`cursor-pointer rounded-lg px-2 py-0.5 text-[11px] font-semibold outline-none ${
                              STATUS_STYLES[subj.status] || STATUS_STYLES.pendiente
                            }`}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="cursando">Cursando</option>
                            <option value="regular">Regular</option>
                            <option value="aprobada">Aprobada</option>
                          </select>
                        </div>

                        {/* Subject Title */}
                        <h4
                          onClick={() => setSelectedSubjectId(subj._id)}
                          className="cursor-pointer text-base font-bold leading-snug text-slate-900 transition hover:text-violet-600 dark:text-white dark:hover:text-violet-300"
                        >
                          {subj.name}
                        </h4>

                        {/* Hours & Prerequisites */}
                        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-violet-400" />
                            {subj.hours?.total || 64}h ({subj.hours?.theory || 32}T /{' '}
                            {subj.hours?.practice || 32}P)
                          </span>

                          {subj.prerequisites?.length > 0 ? (
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] ${
                                allPrereqsMet
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                              }`}
                              title="Códigos de materias correlativas requeridas"
                            >
                              {allPrereqsMet ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                <Lock className="h-3 w-3" />
                              )}
                              Corr: {subj.prerequisites.map((c) => `#${c}`).join(', ')}
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                              • Sin correlativas
                            </span>
                          )}

                          {subj.grade && (
                            <span className="ml-auto rounded-md bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                              Nota: {subj.grade}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer: Workspace Counters & Open Button */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-3 dark:border-white/[0.07]">
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span
                            className="inline-flex items-center gap-1"
                            title="Resúmenes y apuntes (.md + locales)"
                          >
                            <FileText className="h-3.5 w-3.5 text-violet-400" />
                            {subj.notes?.length || 0}
                          </span>
                          <span
                            className="inline-flex items-center gap-1"
                            title="Imágenes, capturas y esquemas"
                          >
                            <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                            {subj.images?.length || 0}
                          </span>
                          <span
                            className="inline-flex items-center gap-1"
                            title="Repositorios GitHub"
                          >
                            <Github className="h-3.5 w-3.5 text-cyan-400" />
                            {subj.githubRepos?.length || 0}
                          </span>
                          <span
                            className="inline-flex items-center gap-1"
                            title="Archivos y recursos"
                          >
                            <FolderOpen className="h-3.5 w-3.5 text-amber-400" />
                            {subj.resources?.length || 0}
                          </span>
                        </div>

                        <button
                          onClick={() => setSelectedSubjectId(subj._id)}
                          className="inline-flex items-center gap-1 rounded-xl bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-600 hover:text-white dark:text-violet-300 dark:hover:bg-violet-600 dark:hover:text-white"
                        >
                          <span>Espacio</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
      )}

      {/* Modal para Agregar Nueva Materia */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 overscroll-contain">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="glass-card relative z-10 w-full max-w-md max-h-[92vh] max-h-[92dvh] overflow-y-auto overscroll-contain border border-violet-500/50 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400">
                  <Plus className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Agregar Nueva Asignatura
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewSubject} className="space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nombre de la Asignatura *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Análisis Matemático I, Introducción al Derecho..."
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  className="os-input text-xs"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Año de Cursada
                  </label>
                  <select
                    value={newSubjYear}
                    onChange={(e) => setNewSubjYear(Number(e.target.value))}
                    className="os-input text-xs"
                  >
                    <option value={1}>1° Año</option>
                    <option value={2}>2° Año</option>
                    <option value={3}>3° Año</option>
                    <option value={4}>4° Año</option>
                    <option value={5}>5° Año</option>
                    <option value={6}>6° Año</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Cuatrimestre / Semestre
                  </label>
                  <select
                    value={newSubjSemester}
                    onChange={(e) => setNewSubjSemester(Number(e.target.value))}
                    className="os-input text-xs"
                  >
                    <option value={1}>1° Cuatrimestre</option>
                    <option value={2}>2° Cuatrimestre</option>
                    <option value={0}>Anual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Área / Categoría (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Ciencias Exactas, Penal, Programación, etc."
                  value={newSubjCategory}
                  onChange={(e) => setNewSubjCategory(e.target.value)}
                  className="os-input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200/60 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="os-btn-ghost px-4 py-2 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newSubjName.trim()}
                  className="os-btn-primary px-4 py-2 text-xs font-bold disabled:opacity-50"
                >
                  Guardar Asignatura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicHubView;
