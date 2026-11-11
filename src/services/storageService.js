import {
  getInitialSubjects,
  getInitialTasks,
  getInitialSchedule,
  getInitialHabits,
  getInitialNotes,
} from '../data/seedData';
import { loadRepoMarkdownNotesBySubject } from '../utils/markdownLoader';

const KEYS = {
  SUBJECTS: 'cyberdef_os_subjects_v4',
  TASKS: 'cyberdef_os_tasks_v2',
  NOTES: 'cyberdef_os_notes_v2',
  SCHEDULE: 'cyberdef_os_schedule_v2',
  HABITS: 'cyberdef_os_habits_v2',
};

export const createId = (prefix = 'id') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const safeRead = (key, fallbackFn) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`Error leyendo ${key} desde LocalStorage:`, err);
  }
  const initial = fallbackFn();
  safeWrite(key, initial);
  return initial;
};

const safeWrite = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error guardando ${key} en LocalStorage (posible límite de cuota):`, err);
    throw new Error(
      'Almacenamiento local lleno. Exporta un backup o usa imágenes en la carpeta public/media/.'
    );
  }
};

export const mergeSubjectsWithRepoMarkdown = (storedSubjects) => {
  const repoMdByCode = loadRepoMarkdownNotesBySubject();

  return storedSubjects.map((subj) => {
    const localNotes = (subj.notes || []).filter((n) => n.source !== 'repo-md');
    const repoNotes = repoMdByCode[subj.code] || [];
    return {
      ...subj,
      units: subj.units || [],
      images: subj.images || [],
      githubRepos: subj.githubRepos || [],
      resources: subj.resources || [],
      notes: [...localNotes, ...repoNotes],
    };
  });
};

export const storageService = {
  loadAll() {
    const rawSubjects = safeRead(KEYS.SUBJECTS, getInitialSubjects);
    const subjects = mergeSubjectsWithRepoMarkdown(rawSubjects);
    const tasks = safeRead(KEYS.TASKS, getInitialTasks);
    const notes = safeRead(KEYS.NOTES, getInitialNotes);
    const schedule = safeRead(KEYS.SCHEDULE, getInitialSchedule);
    const habits = safeRead(KEYS.HABITS, getInitialHabits);

    return { subjects, tasks, notes, schedule, habits };
  },

  saveSubjects(subjects) {
    // No duplicamos en LocalStorage los apuntes estáticos que ya vienen de src/content/apuntes/*.md
    const serializable = subjects.map((s) => ({
      ...s,
      notes: (s.notes || []).filter((n) => n.source !== 'repo-md'),
    }));
    safeWrite(KEYS.SUBJECTS, serializable);
  },

  saveTasks(tasks) {
    safeWrite(KEYS.TASKS, tasks);
  },

  saveNotes(notes) {
    safeWrite(KEYS.NOTES, notes);
  },

  saveSchedule(schedule) {
    safeWrite(KEYS.SCHEDULE, schedule);
  },

  saveHabits(habits) {
    safeWrite(KEYS.HABITS, habits);
  },

  getUsageStats() {
    let totalBytes = 0;
    Object.values(KEYS).forEach((key) => {
      const val = localStorage.getItem(key) || '';
      totalBytes += val.length * 2; // UTF-16 aprox
    });
    const kb = Math.round(totalBytes / 1024);
    const mb = (totalBytes / (1024 * 1024)).toFixed(2);
    return { kb, mb };
  },

  exportBackupJSON() {
    const payload = {
      app: 'CyberDefHub',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        subjects: safeRead(KEYS.SUBJECTS, getInitialSubjects),
        tasks: safeRead(KEYS.TASKS, getInitialTasks),
        notes: safeRead(KEYS.NOTES, getInitialNotes),
        schedule: safeRead(KEYS.SCHEDULE, getInitialSchedule),
        habits: safeRead(KEYS.HABITS, getInitialHabits),
      },
    };

    const dateStr = new Date().toISOString().slice(0, 10);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyber-def-backup-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importBackupJSON(rawJsonString) {
    const parsed = JSON.parse(rawJsonString);
    const data = parsed.data || parsed;

    if (!Array.isArray(data.subjects)) {
      throw new Error('El archivo JSON no contiene una estructura válida de materias.');
    }

    safeWrite(KEYS.SUBJECTS, data.subjects);
    if (Array.isArray(data.tasks)) safeWrite(KEYS.TASKS, data.tasks);
    if (Array.isArray(data.notes)) safeWrite(KEYS.NOTES, data.notes);
    if (Array.isArray(data.schedule)) safeWrite(KEYS.SCHEDULE, data.schedule);
    if (Array.isArray(data.habits)) safeWrite(KEYS.HABITS, data.habits);

    return this.loadAll();
  },

  resetToDefaults() {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
    return this.loadAll();
  },
};
