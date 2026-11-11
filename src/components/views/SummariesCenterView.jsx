import React, { useMemo, useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  BookOpen,
  Clock,
  Tag,
  Trash2,
  Edit3,
  Download,
  Eye,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import MarkdownRenderer from '../common/MarkdownRenderer';

const STATUS_CONFIG = {
  draft: {
    label: 'En progreso',
    badge: 'bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-300',
  },
  review: {
    label: 'Listo para repaso',
    badge: 'bg-cyan-500/15 text-cyan-700 border-cyan-500/30 dark:text-cyan-300',
  },
  completed: {
    label: 'Completado',
    badge: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300',
  },
};

const SummariesCenterView = () => {
  const { subjects, summaries, saveSummary, deleteSummary } = useAppData();

  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'editor' | 'reader'
  const [selectedSummary, setSelectedSummary] = useState(null);

  // Filtros de búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Estado del Editor
  const [editorId, setEditorId] = useState(null);
  const [title, setTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [tags, setTags] = useState('');
  const [readingTime, setReadingTime] = useState(5);
  const [status, setStatus] = useState('draft');
  const [content, setContent] = useState('');
  const [editorPreview, setEditorPreview] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Filtrado de resúmenes
  const filteredSummaries = useMemo(() => {
    return summaries.filter((item) => {
      if (filterSubject !== 'all' && String(item.subjectCode) !== String(filterSubject)) {
        return false;
      }
      if (filterStatus !== 'all' && item.status !== filterStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchContent = (item.content || '').toLowerCase().includes(q);
        const matchTags = (item.tags || '').toLowerCase().includes(q);
        const matchSubject = (item.subjectName || '').toLowerCase().includes(q);
        if (!matchTitle && !matchContent && !matchTags && !matchSubject) return false;
      }
      return true;
    });
  }, [summaries, filterSubject, filterStatus, searchQuery]);

  // Abrir editor para nuevo resumen
  const handleOpenNew = () => {
    setEditorId(null);
    setTitle('');
    setSubjectCode('');
    setSubjectName('');
    setTags('');
    setReadingTime(5);
    setStatus('draft');
    setContent(
      '# Título Principal del Artículo\n\n## 1. Introducción y Conceptos Clave\nEscribe aquí el desarrollo de tu resumen técnico. Los saltos de línea simples o dobles se respetan con párrafos claros.\n\n## 2. Fórmulas Matemáticas (LaTeX / KaTeX)\nPuedes escribir fórmulas en línea como $E = mc^2$ o la entropía de Shannon $H(X) = -\\sum P(x) \\log_2 P(x)$.\n\nY ecuaciones en bloque centrado:\n$$f(x) = \\int_{-\\infty}^{\\infty} \\hat{f}(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi$$\n\n## 3. Lista de Tareas y Notas de Repaso\n- [x] Repasar teoremas y conceptos clave\n- [ ] Resolver guía de ejercicios prácticos\n'
    );
    setEditorPreview(false);
    setActiveTab('editor');
  };

  // Abrir editor para editar existente
  const handleEdit = (summary) => {
    setEditorId(summary.id);
    setTitle(summary.title);
    setSubjectCode(summary.subjectCode || '');
    setSubjectName(summary.subjectName || '');
    setTags(summary.tags || '');
    setReadingTime(summary.readingTime || 5);
    setStatus(summary.status || 'draft');
    setContent(summary.content || '');
    setEditorPreview(false);
    setActiveTab('editor');
  };

  // Ver artículo en modo lectura
  const handleRead = (summary) => {
    setSelectedSummary(summary);
    setActiveTab('reader');
  };

  // Guardar resumen
  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    // Calcular tiempo de lectura estimado si no se ingresó manualmente (~200 palabras por min)
    const wordsCount = content.trim().split(/\s+/).length;
    const computedReadingTime = Math.max(1, Math.ceil(wordsCount / 200));

    const selectedSubjObj = subjects.find((s) => String(s.code) === String(subjectCode));

    const payload = {
      id: editorId || `sum-${Date.now()}`,
      title: title.trim(),
      subjectCode: selectedSubjObj ? selectedSubjObj.code : (subjectCode || null),
      subjectName: selectedSubjObj ? selectedSubjObj.name : (subjectName || 'General'),
      tags: tags.trim(),
      readingTime: Number(readingTime) || computedReadingTime,
      status,
      content,
    };

    await saveSummary(payload);
    setActiveTab('list');
  };

  // Exportar / Descargar en formato Markdown (.md)
  const handleDownloadMarkdown = (summary) => {
    const slug = (summary.title || 'resumen')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const mdText = [
      '---',
      `title: "${summary.title}"`,
      `subject: "${summary.subjectName || 'General'}"`,
      `status: "${summary.status}"`,
      `tags: "${summary.tags || ''}"`,
      `readingTime: "${summary.readingTime || 5} min"`,
      `date: "${(summary.updatedAt || new Date().toISOString()).slice(0, 10)}"`,
      '---',
      '',
      summary.content,
    ].join('\n');

    const blob = new Blob([mdText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slug}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      {/* VISTA 1: LISTADO Y CATÁLOGO DE RESÚMENES */}
      {activeTab === 'list' && (
        <div className="space-y-5">
          {/* Banner Principal */}
          <div className="glass-card flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-bold text-violet-700 dark:text-violet-300">
                  Base de Conocimiento
                </span>
                <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                  {summaries.length} Artículos de Estudio
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Centro de Resúmenes & Artículos de Estudio
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                Documentación profunda, guías conceptuales y artículos de preparación para exámenes.
              </p>
            </div>

            <button
              onClick={handleOpenNew}
              className="os-btn-primary self-start rounded-xl px-4 py-2.5 text-xs font-bold sm:self-center"
            >
              <Plus className="h-4 w-4" />
              <span>Redactar Artículo</span>
            </button>
          </div>

          {/* Filtros y Buscador */}
          <div className="glass-card flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por título, contenido, materia o etiquetas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="os-input py-2 pl-9 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="os-input w-auto py-2 text-xs"
              >
                <option value="all">Todas las Materias</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s.code}>
                    #{s.code} {s.name}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="os-input w-auto py-2 text-xs"
              >
                <option value="all">Todos los Estados</option>
                <option value="draft">En progreso</option>
                <option value="review">Listo para repaso</option>
                <option value="completed">Completado</option>
              </select>
            </div>
          </div>

          {/* Grid de Artículos */}
          {filteredSummaries.length === 0 ? (
            <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
              <BookOpen className="mb-3 h-10 w-10 text-violet-400 opacity-60" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                No hay resúmenes que coincidan con la búsqueda
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Comienza redactando tu primer artículo de estudio o ajusta los filtros.
              </p>
              <button
                onClick={handleOpenNew}
                className="os-btn-primary mt-4 text-xs font-semibold"
              >
                <Plus className="h-4 w-4" />
                <span>Crear Nuevo Resumen</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredSummaries.map((item) => {
                const statusMeta = STATUS_CONFIG[item.status] || STATUS_CONFIG.draft;
                return (
                  <div
                    key={item.id}
                    className="glass-card-hover flex flex-col justify-between p-5"
                  >
                    <div>
                      {/* Cabecera de la tarjeta: Estado + Tiempo de lectura */}
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusMeta.badge}`}
                        >
                          {statusMeta.label}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                          <Clock className="h-3 w-3" />
                          {item.readingTime || 5} min
                        </span>
                      </div>

                      {/* Materia Asociada */}
                      <span className="mb-1 block truncate text-xs font-bold text-violet-600 dark:text-violet-400">
                        {item.subjectName || 'Materia General'}
                      </span>

                      {/* Título del Artículo */}
                      <h3
                        onClick={() => handleRead(item)}
                        className="cursor-pointer text-base font-bold text-slate-900 transition hover:text-cyan-400 dark:text-white"
                      >
                        {item.title}
                      </h3>

                      {/* Preview del Contenido */}
                      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {item.content.replace(/[#*`>\-]/g, '').slice(0, 150)}...
                      </p>

                      {/* Tags */}
                      {item.tags && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {item.tags.split(',').map((tag, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-white/[0.06] dark:text-slate-300"
                            >
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Acciones de la Tarjeta */}
                    <div className="mt-5 flex items-center justify-between border-t border-slate-200/70 pt-3 dark:border-white/[0.08]">
                      <button
                        onClick={() => handleRead(item)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:underline dark:text-violet-400"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Leer artículo</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDownloadMarkdown(item)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-cyan-500/15 hover:text-cyan-400"
                          title="Descargar en formato Markdown (.md)"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-violet-500/15 hover:text-violet-400"
                          title="Editar artículo"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('¿Seguro que deseas eliminar este resumen?')) {
                              deleteSummary(item.id);
                            }
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/15 hover:text-rose-500"
                          title="Eliminar artículo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: EDITOR DE ARTÍCULO EXTENSO */}
      {activeTab === 'editor' && (
        <form onSubmit={handleSave} className="mx-auto w-full max-w-6xl xl:max-w-7xl space-y-3">
          {/* Header Compacto del Editor */}
          <div className="glass-card flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 sm:px-5">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="rounded-xl border border-slate-300 bg-white/50 p-1.5 text-slate-600 hover:bg-white dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 transition"
                title="Volver a la lista de resúmenes"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  {editorId ? 'Editar Resumen / Artículo' : 'Nuevo Resumen Extenso'}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Markdown enriquecido con fórmulas KaTeX ($...$, $$...$$), tablas y bloques de código
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditorPreview(!editorPreview)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/15 px-3 py-1.5 text-xs font-bold text-violet-700 dark:text-violet-300 hover:bg-violet-500/25 transition"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>{editorPreview ? 'Modo Editor' : 'Vista Previa'}</span>
              </button>
              <button type="submit" className="os-btn-primary px-4 py-1.5 text-xs font-bold shadow-neon-purple">
                Guardar Artículo
              </button>
            </div>
          </div>

          {/* Formulario Compacto de Metadatos y Editor */}
          <div className="glass-card p-4 sm:p-5 space-y-3">
            {/* Grid compacto de 5 campos en 2 filas optimizadas */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              {/* Título del Artículo (6 cols) */}
              <div className="sm:col-span-12 lg:col-span-6">
                <label className="mb-0.5 flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  <span>Título del Artículo</span>
                  <span className="text-[10px] text-violet-500 font-mono">*Requerido</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Análisis Profundo de Protocolos TLS 1.3 y Criptografía Asimétrica"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="os-input py-1.5 px-3 text-xs font-semibold"
                  required
                />
              </div>

              {/* Materia Asociada (3 cols) */}
              <div className="sm:col-span-6 lg:col-span-3">
                <label className="mb-0.5 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Materia Asociada
                </label>
                <select
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="os-input py-1.5 px-2.5 text-xs"
                >
                  <option value="">General / Sin Asignatura</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s.code}>
                      #{s.code} {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estado de Avance (3 cols) */}
              <div className="sm:col-span-6 lg:col-span-3">
                <label className="mb-0.5 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Estado de Avance
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="os-input py-1.5 px-2.5 text-xs font-semibold"
                >
                  <option value="draft">En progreso</option>
                  <option value="review">Listo para repaso</option>
                  <option value="completed">Completado</option>
                </select>
              </div>

              {/* Etiquetas (9 cols) */}
              <div className="sm:col-span-8 lg:col-span-9">
                <label className="mb-0.5 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Etiquetas (separadas por coma)
                </label>
                <input
                  type="text"
                  placeholder="Criptografía, Redes, Final, Unidad 3"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="os-input py-1.5 px-3 text-xs"
                />
              </div>

              {/* Tiempo Estimado (3 cols) */}
              <div className="sm:col-span-4 lg:col-span-3">
                <label className="mb-0.5 block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Lectura Estimada (min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={readingTime}
                  onChange={(e) => setReadingTime(e.target.value)}
                  className="os-input py-1.5 px-3 font-mono text-xs"
                />
              </div>
            </div>

            {/* Editor de Texto / Markdown con Altura Generosa */}
            {editorPreview ? (
              <div className="flex flex-col space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <span>Vista Previa del Documento</span>
                  <span className="font-mono text-[10px] text-violet-400">Renderizado en Vivo KaTeX + GFM</span>
                </div>
                <div className="min-h-[540px] max-h-[75vh] overflow-y-auto overscroll-contain rounded-2xl border border-violet-500/30 bg-white/70 p-6 sm:p-8 dark:bg-[#0a0a1a]/80 shadow-inner">
                  <MarkdownRenderer content={content} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <span>Cuerpo del Resumen (Markdown)</span>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                    <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-violet-400 font-bold">$fórmula$</span>
                    <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-violet-400 font-bold">$$bloque$$</span>
                    <span>```código```</span>
                  </div>
                </div>
                <textarea
                  rows={24}
                  placeholder="Redacta el contenido usando encabezados (#, ##), fórmulas LaTeX ($...$), listas, tablas, notas y bloques de código..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="os-input min-h-[520px] font-mono text-xs sm:text-sm leading-relaxed p-4"
                  required
                />
              </div>
            )}
          </div>
        </form>
      )}

      {/* VISTA 3: MODO LECTURA TIPO ARTÍCULO TÉCNICO */}
      {activeTab === 'reader' && selectedSummary && (
        <div className="mx-auto w-full max-w-6xl xl:max-w-7xl space-y-4">
          {/* Barra de Navegación del Lector */}
          <div className="glass-card flex flex-wrap items-center justify-between gap-3 p-3.5 sm:px-5">
            <button
              onClick={() => setActiveTab('list')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white/50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-white dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver a Resúmenes</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadMarkdown(selectedSummary)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/15 px-3 py-2 text-xs font-bold text-cyan-700 hover:bg-cyan-500/25 dark:text-cyan-300 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Exportar .MD</span>
              </button>
              <button
                onClick={() => handleEdit(selectedSummary)}
                className="os-btn-primary px-3.5 py-2 text-xs font-bold shadow-neon-purple"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Editar</span>
              </button>
            </div>
          </div>

          {/* Documento Estilizado Tipo Artículo */}
          <article className="glass-card w-full p-6 sm:p-8 md:p-10 lg:p-12">
            {/* Header del Artículo */}
            <header className="mb-8 border-b border-slate-200/80 pb-6 dark:border-white/10">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-bold text-violet-700 dark:text-violet-300">
                  {selectedSummary.subjectName || 'General'}
                </span>
                <span className="flex items-center gap-1 font-mono text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5" /> {selectedSummary.readingTime || 5} min de lectura
                </span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                    (STATUS_CONFIG[selectedSummary.status] || STATUS_CONFIG.draft).badge
                  }`}
                >
                  {(STATUS_CONFIG[selectedSummary.status] || STATUS_CONFIG.draft).label}
                </span>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
                {selectedSummary.title}
              </h1>

              {selectedSummary.tags && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedSummary.tags.split(',').map((t, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-white/[0.06] dark:text-slate-300"
                    >
                      #{t.trim()}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* Contenido Renderizado */}
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200">
              <MarkdownRenderer content={selectedSummary.content} />
            </div>
          </article>
        </div>
      )}
    </div>
  );
};

export default SummariesCenterView;
