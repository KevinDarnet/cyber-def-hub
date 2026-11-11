import React, { useRef, useState } from 'react';
import {
  X,
  FileText,
  Github,
  FolderOpen,
  Image as ImageIcon,
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  Award,
  Link2,
  Download,
  Edit3,
  Eye,
  Upload,
  Copy,
  Check,
  Maximize2,
  FileCode2,
  CheckSquare,
  Square,
  ListChecks,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { downloadNoteAsMarkdown } from '../../utils/markdownLoader';
import { compressImageToDataUrl } from '../../utils/imageUtils';

const SubjectWorkspaceModal = () => {
  const {
    selectedSubject,
    setSelectedSubjectId,
    subjects,
    updateSubject,
    addSubjectNote,
    updateSubjectNote,
    deleteSubjectNote,
    addSubjectImage,
    deleteSubjectImage,
    addSubjectRepo,
    deleteSubjectRepo,
    addSubjectResource,
    deleteSubjectResource,
    toggleSubjectUnit,
    addSubjectUnit,
    deleteSubjectUnit,
  } = useAppData();

  const [activeTab, setActiveTab] = useState('notes');
  const [newUnitTitle, setNewUnitTitle] = useState('');

  // Markdown Note Editor State
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteTags, setNoteTags] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const inlineImageInputRef = useRef(null);

  // Image Gallery State
  const [imgTitle, setImgTitle] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [imgCaption, setImgCaption] = useState('');
  const [imgUploading, setImgUploading] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [copiedImgId, setCopiedImgId] = useState(null);
  const galleryFileInputRef = useRef(null);

  // GitHub Repo form
  const [repoName, setRepoName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [repoDesc, setRepoDesc] = useState('');
  const [repoLang, setRepoLang] = useState('Python');

  // Resource form
  const [resTitle, setResTitle] = useState('');
  const [resType, setResType] = useState('PDF');
  const [resUrl, setResUrl] = useState('');
  const [resDesc, setResDesc] = useState('');

  if (!selectedSubject) return null;

  const prereqSubjects = (selectedSubject.prerequisites || []).map((code) =>
    subjects.find((s) => s.code === code)
  );

  const resetNoteForm = () => {
    setEditingNoteId(null);
    setNoteTitle('');
    setNoteTags('');
    setNoteContent('');
    setPreviewMode(false);
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    if (editingNoteId) {
      updateSubjectNote(selectedSubject._id, editingNoteId, {
        title: noteTitle.trim(),
        content: noteContent.trim(),
        tags: noteTags.trim(),
      });
    } else {
      addSubjectNote(selectedSubject._id, {
        title: noteTitle.trim(),
        content: noteContent.trim(),
        tags: noteTags.trim() || selectedSubject.category,
      });
    }
    resetNoteForm();
  };

  const startEditingNote = (note) => {
    if (note.source === 'repo-md') {
      // Cargar una copia editable en el editor local
      setEditingNoteId(null);
      setNoteTitle(`${note.title} (Edición Local)`);
    } else {
      setEditingNoteId(note._id);
      setNoteTitle(note.title);
    }
    setNoteTags(note.tags || '');
    setNoteContent(note.content || '');
    setPreviewMode(false);
  };

  const insertSnippet = (snippet) => {
    setNoteContent((prev) => (prev ? `${prev}\n${snippet}` : snippet));
  };

  const handleInlineImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToDataUrl(file);
      const cleanName = file.name.replace(/\.[^.]+$/, '');
      // También lo guardamos en la galería de la materia
      addSubjectImage(selectedSubject._id, {
        title: cleanName,
        url: dataUrl,
        caption: 'Insertada en resumen de estudio',
      });
      insertSnippet(`![${cleanName}](${dataUrl})`);
    } catch (err) {
      alert(err.message);
    }
    e.target.value = '';
  };

  // Gallery Image Handlers
  const handleGalleryFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setImgUrl(dataUrl);
      if (!imgTitle.trim()) {
        setImgTitle(file.name.replace(/\.[^.]+$/, ''));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setImgUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveGalleryImage = (e) => {
    e.preventDefault();
    if (!imgTitle.trim() || !imgUrl.trim()) return;
    addSubjectImage(selectedSubject._id, {
      title: imgTitle.trim(),
      url: imgUrl.trim(),
      caption: imgCaption.trim(),
    });
    setImgTitle('');
    setImgUrl('');
    setImgCaption('');
  };

  const copyImageMarkdown = (img) => {
    const snippet = `![${img.title}](${img.url})`;
    navigator.clipboard?.writeText(snippet);
    setCopiedImgId(img._id);
    setTimeout(() => setCopiedImgId(null), 1800);
  };

  const handleCreateRepo = (e) => {
    e.preventDefault();
    if (!repoName.trim() || !repoUrl.trim()) return;
    addSubjectRepo(selectedSubject._id, {
      name: repoName.trim(),
      url: repoUrl.trim(),
      description: repoDesc.trim(),
      language: repoLang.trim() || 'Python',
    });
    setRepoName('');
    setRepoUrl('');
    setRepoDesc('');
  };

  const handleCreateResource = (e) => {
    e.preventDefault();
    if (!resTitle.trim() || !resUrl.trim()) return;
    addSubjectResource(selectedSubject._id, {
      title: resTitle.trim(),
      type: resType,
      url: resUrl.trim(),
      description: resDesc.trim(),
    });
    setResTitle('');
    setResUrl('');
    setResDesc('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 overscroll-contain">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md"
        onClick={() => setSelectedSubjectId(null)}
      />

      <div className="glass-card relative z-10 flex max-h-[92vh] max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden border border-violet-500/30">
        {/* Top Window Header */}
        <div className="border-b border-slate-200/80 bg-slate-100/70 px-5 py-4 dark:border-white/10 dark:bg-white/[0.03] sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-violet-600 px-2.5 py-0.5 font-mono text-xs font-bold text-white">
                  Materia #{selectedSubject.code}
                </span>
                <span className="rounded-lg bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                  {selectedSubject.year === 0
                    ? 'Nivelación Universitaria'
                    : `${selectedSubject.year}° Año • ${selectedSubject.semester}° Cuatrimestre`}
                </span>
                <span className="rounded-lg bg-cyan-500/15 px-2.5 py-0.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                  {selectedSubject.category}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  {selectedSubject.hours?.total} hs totales
                </span>
              </div>

              <h2 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
                {selectedSubject.name}
              </h2>
            </div>

            <button
              onClick={() => setSelectedSubjectId(null)}
              className="rounded-xl border border-slate-300/80 bg-white/80 p-2 text-slate-600 transition hover:bg-rose-500 hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              aria-label="Cerrar ventana"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Academic Status, Final Grade & Prerequisites Bar */}
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Estado:
                </label>
                <select
                  value={selectedSubject.status}
                  onChange={(e) =>
                    updateSubject(selectedSubject._id, { status: e.target.value })
                  }
                  className="os-input w-auto py-1 text-xs font-semibold"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="cursando">Cursando</option>
                  <option value="regular">Regular</option>
                  <option value="aprobada">Aprobada</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <Award className="h-3.5 w-3.5 text-amber-400" />
                  Nota Final:
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="—"
                  value={selectedSubject.grade || ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    updateSubject(selectedSubject._id, { grade: val });
                  }}
                  className="os-input w-16 py-1 text-center font-mono text-xs font-bold"
                />
              </div>
            </div>

            {prereqSubjects.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-500 dark:text-slate-400">Correlativas:</span>
                {prereqSubjects.map((p, idx) =>
                  p ? (
                    <button
                      key={p._id}
                      onClick={() => setSelectedSubjectId(p._id)}
                      className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-700 hover:bg-violet-500/20 dark:text-violet-300"
                    >
                      #{p.code} {p.name}
                    </button>
                  ) : (
                    <span key={idx} className="text-xs text-slate-400">
                      #{selectedSubject.prerequisites[idx]}
                    </span>
                  )
                )}
              </div>
            )}
          </div>

          {/* Workspace Navigation Tabs (5 Tabs) */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              {
                id: 'notes',
                label: `Resúmenes & Apuntes (${selectedSubject.notes?.length || 0})`,
                icon: FileText,
              },
              {
                id: 'units',
                label: `Unidades & Temas (${
                  (selectedSubject.units || []).filter((u) => u.completed).length
                }/${selectedSubject.units?.length || 0})`,
                icon: ListChecks,
              },
              {
                id: 'images',
                label: `Imágenes & Esquemas (${selectedSubject.images?.length || 0})`,
                icon: ImageIcon,
              },
              {
                id: 'repos',
                label: `GitHub (${selectedSubject.githubRepos?.length || 0})`,
                icon: Github,
              },
              {
                id: 'resources',
                label: `Recursos (${selectedSubject.resources?.length || 0})`,
                icon: FolderOpen,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                    active
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-neon-purple'
                      : 'bg-slate-200/70 text-slate-600 hover:bg-slate-300/70 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Workspace Tab Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6">
          {/* ================= TAB 1: RESÚMENES MARKDOWN & APUNTES ================= */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <form
                onSubmit={handleSaveNote}
                className="glass-subcard space-y-3 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    {editingNoteId
                      ? '✏️ Editando Resumen en LocalStorage'
                      : '📝 Nuevo Resumen de Estudio (Soporta Markdown e Imágenes)'}
                  </h3>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewMode((p) => !p)}
                      className="inline-flex items-center gap-1 rounded-lg border border-violet-500/30 bg-violet-500/15 px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:text-violet-300"
                    >
                      {previewMode ? (
                        <>
                          <Edit3 className="h-3 w-3" /> Editar Markdown
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" /> Vista Previa
                        </>
                      )}
                    </button>

                    {editingNoteId && (
                      <button
                        type="button"
                        onClick={resetNoteForm}
                        className="rounded-lg bg-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:bg-white/10 dark:text-slate-300"
                      >
                        Cancelar edición
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <input
                    type="text"
                    placeholder="Título del resumen (ej: Unidad 2 - Permisos SUID y Namespaces)"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="os-input text-sm sm:col-span-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Etiquetas (ej: Parcial 1, Linux)"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    className="os-input text-sm"
                  />
                </div>

                {/* Quick Markdown Formatting Toolbar */}
                {!previewMode && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { label: 'H2', snippet: '## Subtítulo de Sección' },
                      { label: 'Negrita', snippet: '**concepto clave**' },
                      {
                        label: 'Bloque Código',
                        snippet: '```bash\n# comando o script\n```',
                      },
                      { label: 'Cita / Alerta', snippet: '> Nota importante para examen' },
                      { label: 'Checklist', snippet: '- [ ] Tema pendiente de repaso' },
                      {
                        label: 'Tabla',
                        snippet:
                          '| Concepto | Detalle |\n| --- | --- |\n| Dato A | Valor B |',
                      },
                    ].map((tool) => (
                      <button
                        key={tool.label}
                        type="button"
                        onClick={() => insertSnippet(tool.snippet)}
                        className="rounded-lg border border-slate-300/80 bg-white/70 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-violet-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                      >
                        + {tool.label}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => inlineImageInputRef.current?.click()}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-300"
                    >
                      <ImageIcon className="h-3 w-3" />
                      Insertar Imagen PC
                    </button>
                    <input
                      ref={inlineImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleInlineImageUpload}
                      className="hidden"
                    />
                  </div>
                )}

                {previewMode ? (
                  <div className="min-h-[140px] rounded-xl border border-violet-500/30 bg-white/60 p-4 dark:bg-[#090917]/80">
                    {noteContent.trim() ? (
                      <MarkdownRenderer content={noteContent} />
                    ) : (
                      <p className="text-xs italic text-slate-400">
                        Escribe contenido Markdown para previsualizarlo aquí...
                      </p>
                    )}
                  </div>
                ) : (
                  <textarea
                    rows={6}
                    placeholder="Escribe tu resumen en Markdown (# Títulos, **negrita**, ```bloques de código```, tablas, listas o ![Esquema](./media/imagen.png))..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="os-input font-mono text-xs leading-relaxed"
                    required
                  />
                )}

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Se guarda al instante en LocalStorage y puedes descargarlo como <code>.md</code> para GitHub Pages.
                  </span>
                  <button type="submit" className="os-btn-primary text-xs">
                    <Plus className="h-4 w-4" />
                    {editingNoteId ? 'Actualizar Resumen' : 'Guardar Resumen'}
                  </button>
                </div>
              </form>

              {/* List of Rendered Markdown Notes */}
              <div className="space-y-4">
                {selectedSubject.notes?.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">
                    Todavía no hay resúmenes en esta materia. Crea uno arriba o coloca un archivo <code>.md</code> con <code>subjectCode: {selectedSubject.code}</code> en <code>src/content/apuntes/</code>.
                  </p>
                ) : (
                  selectedSubject.notes?.map((note) => {
                    const isRepoMd = note.source === 'repo-md';
                    return (
                      <article
                        key={note._id}
                        className={`glass-subcard p-5 ${
                          isRepoMd
                            ? 'border-l-4 border-l-cyan-400'
                            : 'border-l-4 border-l-violet-500'
                        }`}
                      >
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-2 border-b border-slate-200/70 pb-3 dark:border-white/10">
                          <div>
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  isRepoMd
                                    ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                                    : 'bg-violet-500/15 text-violet-700 dark:text-violet-300'
                                }`}
                              >
                                <FileCode2 className="h-3 w-3" />
                                {isRepoMd
                                  ? `Archivo Repo (${note.fileName})`
                                  : 'LocalStorage'}
                              </span>
                              {note.tags && (
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                  • {note.tags}
                                </span>
                              )}
                              {note.updatedAt && (
                                <span className="font-mono text-[10px] text-slate-400">
                                  ({note.updatedAt})
                                </span>
                              )}
                            </div>

                            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                              {note.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                downloadNoteAsMarkdown(selectedSubject, note)
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/15 px-2.5 py-1 text-[11px] font-semibold text-cyan-700 hover:bg-cyan-500/25 dark:text-cyan-300"
                              title="Descargar como archivo .md listo para src/content/apuntes/"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>.MD</span>
                            </button>

                            <button
                              onClick={() => startEditingNote(note)}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-200/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-violet-500 hover:text-white dark:bg-white/10 dark:text-slate-300"
                              title={
                                isRepoMd
                                  ? 'Clonar a LocalStorage para editar'
                                  : 'Editar resumen'
                              }
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span>{isRepoMd ? 'Clonar' : 'Editar'}</span>
                            </button>

                            {!isRepoMd && (
                              <button
                                onClick={() =>
                                  deleteSubjectNote(selectedSubject._id, note._id)
                                }
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/15 hover:text-rose-500"
                                title="Eliminar resumen local"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <MarkdownRenderer content={note.content} />
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 2: UNIDADES & TEMAS (CHECKLIST) ================= */}
          {activeTab === 'units' && (
            <div className="space-y-5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newUnitTitle.trim()) return;
                  addSubjectUnit(selectedSubject._id, newUnitTitle.trim());
                  setNewUnitTitle('');
                }}
                className="glass-subcard space-y-3 p-4"
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  📋 Agregar Unidad o Tema a Repasar
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej: Unidad 2: Operaciones con matrices y determinantes"
                    value={newUnitTitle}
                    onChange={(e) => setNewUnitTitle(e.target.value)}
                    className="os-input text-sm flex-1"
                    required
                  />
                  <button type="submit" className="os-btn-primary text-xs shrink-0">
                    <Plus className="h-4 w-4" />
                    <span>Agregar</span>
                  </button>
                </div>
              </form>

              {/* Progress Bar of Completed Units */}
              <div className="glass-subcard p-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Progreso de Contenidos y Temas
                  </span>
                  <span className="font-mono font-bold text-violet-600 dark:text-violet-400">
                    {(selectedSubject.units || []).filter((u) => u.completed).length} de{' '}
                    {selectedSubject.units?.length || 0} completados (
                    {selectedSubject.units?.length
                      ? Math.round(
                          ((selectedSubject.units || []).filter((u) => u.completed).length /
                            selectedSubject.units.length) *
                            100
                        )
                      : 0}
                    %)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-300"
                    style={{
                      width: `${
                        selectedSubject.units?.length
                          ? Math.round(
                              ((selectedSubject.units || []).filter((u) => u.completed).length /
                                selectedSubject.units.length) *
                                100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Checklist items */}
              <div className="space-y-2">
                {(!selectedSubject.units || selectedSubject.units.length === 0) ? (
                  <p className="py-8 text-center text-sm text-slate-400">
                    No hay unidades ni temas registrados en esta materia aún. Puedes agregarlos arriba para dar seguimiento a tu avance.
                  </p>
                ) : (
                  selectedSubject.units.map((unit) => (
                    <div
                      key={unit.id}
                      className={`glass-subcard flex items-center justify-between gap-3 p-3 transition-all ${
                        unit.completed ? 'opacity-85 bg-emerald-500/5' : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSubjectUnit(selectedSubject._id, unit.id)}
                        className="flex items-center gap-3 text-left flex-1"
                      >
                        {unit.completed ? (
                          <CheckSquare className="h-5 w-5 text-emerald-500 shrink-0" />
                        ) : (
                          <Square className="h-5 w-5 text-slate-400 hover:text-violet-400 shrink-0" />
                        )}
                        <span
                          className={`text-sm ${
                            unit.completed
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'font-medium text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {unit.title}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteSubjectUnit(selectedSubject._id, unit.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/15 hover:text-rose-500 shrink-0"
                        title="Eliminar unidad"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 3: GALERÍA DE IMÁGENES & ESQUEMAS ================= */}
          {activeTab === 'images' && (
            <div className="space-y-5">
              <form
                onSubmit={handleSaveGalleryImage}
                className="glass-subcard space-y-3 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    🖼️ Subir Captura, Esquema o Diagrama de Estudio
                  </h3>

                  <button
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-300"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {imgUploading ? 'Comprimiendo...' : 'Seleccionar Imagen desde PC'}
                  </button>
                  <input
                    ref={galleryFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryFileSelect}
                    className="hidden"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Título (ej: Captura Handshake TCP en Wireshark)"
                    value={imgTitle}
                    onChange={(e) => setImgTitle(e.target.value)}
                    className="os-input text-sm"
                    required
                  />
                  <input
                    type="text"
                    placeholder="URL, ./media/archivo.png o imagen cargada desde PC"
                    value={imgUrl}
                    onChange={(e) => setImgUrl(e.target.value)}
                    className="os-input text-sm"
                    required
                  />
                </div>

                <input
                  type="text"
                  placeholder="Descripción o explicación breve de la imagen (opcional)"
                  value={imgCaption}
                  onChange={(e) => setImgCaption(e.target.value)}
                  className="os-input text-sm"
                />

                {imgUrl && (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2.5">
                    <img
                      src={imgUrl}
                      alt="Vista previa"
                      className="h-16 w-24 rounded-lg object-cover"
                    />
                    <span className="text-xs text-emerald-700 dark:text-emerald-300">
                      Imagen lista para guardar (optimizada para almacenamiento rápido).
                    </span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button type="submit" className="os-btn-primary text-xs">
                    <Plus className="h-4 w-4" />
                    Guardar en Galería
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {selectedSubject.images?.length === 0 ? (
                  <p className="col-span-2 py-8 text-center text-sm text-slate-400">
                    Aún no hay imágenes ni diagramas cargados en esta materia.
                  </p>
                ) : (
                  selectedSubject.images?.map((img) => (
                    <div
                      key={img._id}
                      className="glass-subcard flex flex-col justify-between overflow-hidden"
                    >
                      <div
                        onClick={() => setLightboxImg(img)}
                        className="group relative flex h-48 cursor-zoom-in items-center justify-center bg-slate-950/60 p-2"
                      >
                        <img
                          src={img.url}
                          alt={img.title}
                          className="max-h-full max-w-full rounded-lg object-contain transition duration-300 group-hover:scale-[1.02]"
                        />
                        <span className="absolute right-2.5 top-2.5 rounded-lg bg-black/65 p-1.5 text-white opacity-0 transition group-hover:opacity-100">
                          <Maximize2 className="h-4 w-4" />
                        </span>
                      </div>

                      <div className="p-3.5">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {img.title}
                        </h4>
                        {img.caption && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {img.caption}
                          </p>
                        )}

                        <div className="mt-3 flex items-center justify-between border-t border-slate-200/70 pt-2.5 dark:border-white/[0.06]">
                          <button
                            onClick={() => copyImageMarkdown(img)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:underline dark:text-violet-400"
                            title="Copiar código Markdown para pegar en un resumen"
                          >
                            {copiedImgId === img._id ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-emerald-500">
                                  Markdown copiado
                                </span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copiar sintaxis .MD</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() =>
                              deleteSubjectImage(selectedSubject._id, img._id)
                            }
                            className="rounded-lg p-1 text-slate-400 hover:bg-rose-500/15 hover:text-rose-500"
                            title="Eliminar imagen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 3: GITHUB REPOS ================= */}
          {activeTab === 'repos' && (
            <div className="space-y-5">
              <form
                onSubmit={handleCreateRepo}
                className="glass-subcard space-y-3 p-4"
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  Vincular Repositorio de GitHub
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <input
                    type="text"
                    placeholder="Nombre del repo (ej: tp-sockets-c)"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    className="os-input text-sm"
                    required
                  />
                  <input
                    type="url"
                    placeholder="https://github.com/usuario/repositorio"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="os-input text-sm"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Lenguaje (ej: Python, C, Shell)"
                    value={repoLang}
                    onChange={(e) => setRepoLang(e.target.value)}
                    className="os-input text-sm"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Descripción breve del código o laboratorio..."
                  value={repoDesc}
                  onChange={(e) => setRepoDesc(e.target.value)}
                  className="os-input text-sm"
                />
                <div className="flex justify-end">
                  <button type="submit" className="os-btn-primary text-xs">
                    <Github className="h-4 w-4" />
                    Añadir Repositorio
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {selectedSubject.githubRepos?.length === 0 ? (
                  <p className="col-span-2 py-8 text-center text-sm text-slate-400">
                    No hay repositorios de GitHub vinculados aún.
                  </p>
                ) : (
                  selectedSubject.githubRepos?.map((repo) => (
                    <div
                      key={repo._id}
                      className="glass-subcard flex flex-col justify-between p-4"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Github className="h-4 w-4 shrink-0 text-cyan-400" />
                            <h4 className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                              {repo.name}
                            </h4>
                          </div>
                          <button
                            onClick={() =>
                              deleteSubjectRepo(selectedSubject._id, repo._id)
                            }
                            className="rounded-lg p-1 text-slate-400 hover:bg-rose-500/15 hover:text-rose-500"
                            title="Quitar repositorio"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {repo.description && (
                          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                            {repo.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-200/70 pt-2.5 dark:border-white/[0.06]">
                        <span className="rounded-md bg-cyan-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-700 dark:text-cyan-300">
                          {repo.language || 'Código'}
                        </span>
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:underline dark:text-violet-400"
                        >
                          <span>Abrir en GitHub</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 4: ARCHIVOS Y RECURSOS ================= */}
          {activeTab === 'resources' && (
            <div className="space-y-5">
              <form
                onSubmit={handleCreateResource}
                className="glass-subcard space-y-3 p-4"
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Agregar Archivo, PDF, Bibliografía o Recurso
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <input
                    type="text"
                    placeholder="Nombre del archivo o libro..."
                    value={resTitle}
                    onChange={(e) => setResTitle(e.target.value)}
                    className="os-input text-sm sm:col-span-2"
                    required
                  />
                  <select
                    value={resType}
                    onChange={(e) => setResType(e.target.value)}
                    className="os-input text-sm"
                  >
                    <option value="PDF">PDF / Documento</option>
                    <option value="Libro">Libro / Manual</option>
                    <option value="Guía">Guía de TP</option>
                    <option value="Slides">Diapositivas</option>
                    <option value="Video">Clase Grabada / Video</option>
                    <option value="Herramienta">Herramienta / Lab</option>
                  </select>
                  <input
                    type="text"
                    placeholder="URL (Drive/Web) o ./pdfs/guia.pdf"
                    value={resUrl}
                    onChange={(e) => setResUrl(e.target.value)}
                    className="os-input text-sm"
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Notas adicionales (ej: Capítulos 4 y 5 entran en el parcial)"
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  className="os-input text-sm"
                />
                <div className="flex justify-end">
                  <button type="submit" className="os-btn-primary text-xs">
                    <Plus className="h-4 w-4" />
                    Guardar Recurso
                  </button>
                </div>
              </form>

              <div className="space-y-2.5">
                {selectedSubject.resources?.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">
                    No hay archivos ni bibliografía registrada en esta materia.
                  </p>
                ) : (
                  selectedSubject.resources?.map((res) => (
                    <div
                      key={res._id}
                      className="glass-subcard flex flex-wrap items-center justify-between gap-3 p-3.5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">
                            {res.type}
                          </span>
                          <h4 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {res.title}
                          </h4>
                        </div>
                        {res.description && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {res.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-xl bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-600 hover:text-white dark:text-violet-300"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          <span>Abrir</span>
                        </a>
                        <button
                          onClick={() =>
                            deleteSubjectResource(selectedSubject._id, res._id)
                          }
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/15 hover:text-rose-500"
                          title="Eliminar recurso"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Image Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={() => setLightboxImg(null)}
        >
          <div
            className="relative max-h-[92vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute -top-10 right-0 rounded-xl bg-white/15 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500"
            >
              <span className="inline-flex items-center gap-1">
                <X className="h-4 w-4" /> Cerrar vista
              </span>
            </button>
            <img
              src={lightboxImg.url}
              alt={lightboxImg.title}
              className="max-h-[82vh] w-auto rounded-2xl border border-white/15 bg-[#0b0b1a] object-contain shadow-2xl"
            />
            <div className="mt-2.5 text-center">
              <p className="text-sm font-bold text-white">{lightboxImg.title}</p>
              {lightboxImg.caption && (
                <p className="text-xs text-slate-300">{lightboxImg.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectWorkspaceModal;
