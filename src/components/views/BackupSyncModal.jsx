import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Upload,
  HardDrive,
  FileCode2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

const BackupSyncModal = () => {
  const {
    backupModalOpen,
    setBackupModalOpen,
    storageUsage,
    exportBackup,
    importBackup,
    resetAllData,
  } = useAppData();

  const fileInputRef = useRef(null);
  const [feedback, setFeedback] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!backupModalOpen) return null;

  const usagePct = Math.min(100, Math.round((storageUsage.kb / 5120) * 100));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        importBackup(ev.target.result);
        setFeedback({
          type: 'ok',
          msg: 'Backup restaurado exitosamente en LocalStorage.',
        });
      } catch (err) {
        setFeedback({
          type: 'err',
          msg: err.message || 'Archivo JSON inválido.',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-contain">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={() => setBackupModalOpen(false)}
      />

      <div className="glass-card relative z-10 w-full max-w-xl max-h-[92vh] max-h-[92dvh] overflow-y-auto overscroll-contain border border-violet-500/30 p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-neon-purple">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Almacenamiento Local & GitHub Pages
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                100% Frontend Serverless • LocalStorage + Archivos Markdown (.md)
              </p>
            </div>
          </div>

          <button
            onClick={() => setBackupModalOpen(false)}
            className="rounded-xl p-1.5 text-slate-500 hover:bg-rose-500 hover:text-white dark:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Storage Quota Meter */}
        <div className="glass-subcard mb-4 p-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Uso actual de LocalStorage en este navegador
            </span>
            <span className="font-mono font-bold text-violet-600 dark:text-violet-300">
              {storageUsage.kb} KB (~{storageUsage.mb} MB / 5.00 MB)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all"
              style={{ width: `${Math.max(2, usagePct)}%` }}
            />
          </div>
        </div>

        {/* Workflow Guide */}
        <div className="glass-subcard mb-5 space-y-2 border-l-4 border-l-cyan-400 p-4 text-xs text-slate-600 dark:text-slate-300">
          <p className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <FileCode2 className="h-4 w-4 text-cyan-400" />
            ¿Cómo funciona con GitHub Pages?
          </p>
          <p>
            1. <strong>Edición inmediata:</strong> Todo lo que anotes, califiques o subas se guarda al instante en <code>LocalStorage</code>.
          </p>
          <p>
            2. <strong>Resúmenes permanentes en Git:</strong> En cualquier materia puedes pulsar <strong>&ldquo;Descargar .MD&rdquo;</strong> sobre un resumen y guardarlo en <code>src/content/apuntes/</code> (y tus diagramas o imágenes grandes en <code>public/media/</code>). Al hacer <code>git push</code>, quedarán publicados en tu web de GitHub Pages para cualquier dispositivo.
          </p>
        </div>

        {feedback && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-medium ${
              feedback.type === 'ok'
                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                : 'border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-300'
            }`}
          >
            {feedback.type === 'ok' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={exportBackup}
            className="os-btn-primary py-2.5 text-xs"
          >
            <Download className="h-4 w-4" />
            Exportar Backup (.JSON)
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/15 px-4 py-2.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-500/25 dark:text-violet-300"
          >
            <Upload className="h-4 w-4" />
            Importar Backup (.JSON)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Reset Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-200/80 pt-3.5 dark:border-white/10">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-500 dark:text-slate-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restablecer datos de fábrica
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-rose-500">
                ¿Borrar cambios locales?
              </span>
              <button
                onClick={() => {
                  resetAllData();
                  setConfirmReset(false);
                  setFeedback({
                    type: 'ok',
                    msg: 'Datos restablecidos a los valores iniciales de la carrera.',
                  });
                }}
                className="rounded-lg bg-rose-500 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-600"
              >
                Sí, restablecer
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-slate-300"
              >
                Cancelar
              </button>
            </div>
          )}

          <span className="text-[11px] text-slate-400">
            GitHub Pages Ready
          </span>
        </div>
      </div>
    </div>
  );
};

export default BackupSyncModal;
