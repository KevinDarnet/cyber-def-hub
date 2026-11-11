import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createId, storageService } from '../services/storageService';
import { firestoreService } from '../services/db';
import {
  getInitialSubjects,
  getInitialTasks,
  getInitialSchedule,
  getInitialHabits,
  getInitialNotes,
} from '../data/seedData';
import { useAuth } from './AuthContext';

const AppDataContext = createContext(null);

export const getTodayISO = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const POMODORO_MODES = {
  focus: { label: 'Focus', minutes: 25 },
  shortBreak: { label: 'Pausa', minutes: 5 },
  longBreak: { label: 'Descanso Largo', minutes: 15 },
};

export const AppDataProvider = ({ children }) => {
  const { currentUser, userProfile } = useAuth();

  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayISO);
  const [backupModalOpen, setBackupModalOpen] = useState(false);

  const initialLocal = useMemo(() => storageService.loadAll(), []);

  const [subjects, setSubjects] = useState(initialLocal.subjects);
  const [tasks, setTasks] = useState(initialLocal.tasks);
  const [notes, setNotes] = useState(initialLocal.notes);
  const [schedule, setSchedule] = useState(initialLocal.schedule);
  const [habits, setHabits] = useState(initialLocal.habits);
  const [summaries, setSummaries] = useState(() => {
    try {
      const saved = localStorage.getItem('cyberdef_summaries_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [storageUsage, setStorageUsage] = useState(() => storageService.getUsageStats());
  const refreshUsage = () => setStorageUsage(storageService.getUsageStats());

  // Sincronizar datos con Firestore si el usuario está autenticado
  useEffect(() => {
    if (!currentUser) {
      // Si se cierra la sesión, restablecer el estado en memoria a limpio
      const freshSubs = getInitialSubjects();
      setSubjects(freshSubs);
      setTasks([]);
      setNotes([]);
      setSchedule([]);
      setHabits([]);
      setSummaries([]);
      return;
    }

    let isMounted = true;
    const fetchUserData = async () => {
      try {
        const cloudData = await firestoreService.getUserData(currentUser.uid, 'academic_data');
        if (cloudData && isMounted) {
          if (Array.isArray(cloudData.subjects)) {
            setSubjects(cloudData.subjects);
            storageService.saveSubjects(cloudData.subjects);
          }
          if (Array.isArray(cloudData.tasks)) {
            setTasks(cloudData.tasks);
            storageService.saveTasks(cloudData.tasks);
          }
          if (Array.isArray(cloudData.notes)) {
            setNotes(cloudData.notes);
            storageService.saveNotes(cloudData.notes);
          }
          if (Array.isArray(cloudData.schedule)) {
            setSchedule(cloudData.schedule);
            storageService.saveSchedule(cloudData.schedule);
          }
          if (Array.isArray(cloudData.habits)) {
            setHabits(cloudData.habits);
            storageService.saveHabits(cloudData.habits);
          }
        } else if (isMounted) {
          // Si el usuario no tiene registros académicos en Firestore, inicializar en blanco
          const freshSubs = getInitialSubjects();
          setSubjects(freshSubs);
          storageService.saveSubjects(freshSubs);
          await firestoreService.saveUserData(currentUser.uid, 'academic_data', {
            subjects: freshSubs,
            tasks: [],
            schedule: [],
            habits: [],
            notes: [],
          });
        }

        const cloudSummaries = await firestoreService.getSummaries(currentUser.uid);
        if (cloudSummaries && isMounted) {
          setSummaries(cloudSummaries);
          localStorage.setItem('cyberdef_summaries_v1', JSON.stringify(cloudSummaries));
        }
      } catch (err) {
        console.warn('Error sincronizando con Firestore:', err);
      }
    };

    fetchUserData();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Escuchar cuando el usuario completa el Onboarding y selecciona una nueva carrera
  useEffect(() => {
    const handleCareerUpdated = (e) => {
      if (e.detail?.subjects !== undefined) {
        setSubjects(e.detail.subjects);
        storageService.saveSubjects(e.detail.subjects);
      }
      if (e.detail?.career?.isCustom && e.detail.subjects.length === 0) {
        setTasks([]);
        setNotes([]);
        setSchedule([]);
        setHabits([]);
        storageService.saveTasks([]);
        storageService.saveNotes([]);
        storageService.saveSchedule([]);
        storageService.saveHabits([]);
      }
    };
    window.addEventListener('cyberdef_career_updated', handleCareerUpdated);
    window.addEventListener('studyhub_career_updated', handleCareerUpdated);
    return () => {
      window.removeEventListener('cyberdef_career_updated', handleCareerUpdated);
      window.removeEventListener('studyhub_career_updated', handleCareerUpdated);
    };
  }, []);

  // Global Pomodoro Timer
  const [pomoMode, setPomoMode] = useState('focus');
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_MODES.focus.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  useEffect(() => {
    if (!isRunning) return undefined;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          if (pomoMode === 'focus') {
            setCompletedSessions((s) => s + 1);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, pomoMode]);

  const switchPomoMode = (modeKey) => {
    setIsRunning(false);
    setPomoMode(modeKey);
    setSecondsLeft(POMODORO_MODES[modeKey].minutes * 60);
  };

  const resetPomodoro = () => {
    setIsRunning(false);
    setSecondsLeft(POMODORO_MODES[pomoMode].minutes * 60);
  };

  // Helper para persistir materias en LocalStorage y Firestore
  const commitSubjects = (updater) => {
    setSubjects((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      storageService.saveSubjects(next);
      if (currentUser) {
        firestoreService.saveUserData(currentUser.uid, 'academic_data', { subjects: next });
      }
      refreshUsage();
      return next;
    });
  };

  // Acciones de Materias
  const handleCreateSubject = (subjectPayload) => {
    const nextCode =
      subjects.length > 0 ? Math.max(...subjects.map((s) => Number(s.code) || 0)) + 1 : 1;
    const newSubj = {
      _id: createId('subj'),
      code: nextCode,
      name: 'Nueva Asignatura',
      year: 1,
      semester: 1,
      cycle: 'Ciclo Básico',
      category: 'General',
      hours: { theory: 32, practice: 32, total: 64 },
      prerequisites: [],
      status: 'pendiente',
      grade: null,
      units: [],
      notes: [],
      images: [],
      githubRepos: [],
      resources: [],
      ...subjectPayload,
    };
    commitSubjects((prev) => [...prev, newSubj]);
    return newSubj;
  };

  const handleUpdateSubject = (id, updates) => {
    commitSubjects((prev) =>
      prev.map((s) => (s._id === id ? { ...s, ...updates } : s))
    );
  };

  const handleAddSubjectNote = (id, { title, content, tags = '' }) => {
    const newNote = {
      _id: createId('snote'),
      title,
      content,
      tags,
      source: 'local',
      updatedAt: getTodayISO(),
    };
    commitSubjects((prev) =>
      prev.map((s) =>
        s._id === id ? { ...s, notes: [newNote, ...(s.notes || [])] } : s
      )
    );
  };

  const handleUpdateSubjectNote = (id, noteId, updates) => {
    commitSubjects((prev) =>
      prev.map((s) =>
        s._id === id
          ? {
              ...s,
              notes: (s.notes || []).map((n) =>
                n._id === noteId
                  ? { ...n, ...updates, updatedAt: getTodayISO() }
                  : n
              ),
            }
          : s
      )
    );
  };

  const handleDeleteSubjectNote = (id, noteId) => {
    commitSubjects((prev) =>
      prev.map((s) =>
        s._id === id
          ? { ...s, notes: (s.notes || []).filter((n) => n._id !== noteId) }
          : s
      )
    );
  };

  // Unidades y Temas de la materia
  const handleToggleSubjectUnit = (subjectId, unitId) => {
    commitSubjects((prev) =>
      prev.map((s) => {
        if (s._id !== subjectId) return s;
        const units = (s.units || []).map((u) =>
          u.id === unitId ? { ...u, completed: !u.completed } : u
        );
        return { ...s, units };
      })
    );
  };

  const handleAddSubjectUnit = (subjectId, title) => {
    const newUnit = {
      id: createId('unit'),
      title,
      completed: false,
    };
    commitSubjects((prev) =>
      prev.map((s) =>
        s._id === subjectId
          ? { ...s, units: [...(s.units || []), newUnit] }
          : s
      )
    );
  };

  const handleDeleteSubjectUnit = (subjectId, unitId) => {
    commitSubjects((prev) =>
      prev.map((s) =>
        s._id === subjectId
          ? { ...s, units: (s.units || []).filter((u) => u.id !== unitId) }
          : s
      )
    );
  };

  // Galería de imágenes por materia
  const handleAddSubjectImage = (id, { title, url, caption = '' }) => {
    const newImg = {
      _id: createId('simg'),
      title,
      url,
      caption,
      createdAt: getTodayISO(),
    };
    commitSubjects((prev) =>
      prev.map((s) =>
        s._id === id ? { ...s, images: [newImg, ...(s.images || [])] } : s
      )
    );
    return newImg;
  };

  const handleDeleteSubjectImage = (id, imageId) => {
    commitSubjects((prev) =>
      prev.map((s) =>
        s._id === id
          ? { ...s, images: (s.images || []).filter((img) => img._id !== imageId) }
          : s
      )
    );
  };

  const handleAddSubjectRepo = (id, payload) => {
    const newRepo = { _id: createId('repo'), ...payload };
    commitSubjects((prev) =>
      prev.map((s) =>
        s._id === id
          ? { ...s, githubRepos: [newRepo, ...(s.githubRepos || [])] }
          : s
      )
    );
  };

  const handleDeleteSubjectRepo = (id, repoId) => {
    commitSubjects((prev) =>
      prev.map((s) =>
        s._id === id
          ? {
              ...s,
              githubRepos: (s.githubRepos || []).filter((r) => r._id !== repoId),
            }
          : s
      )
    );
  };

  const handleAddSubjectResource = (id, payload) => {
    const newRes = { _id: createId('res'), ...payload };
    commitSubjects((prev) =>
      prev.map((s) =>
        s._id === id
          ? { ...s, resources: [newRes, ...(s.resources || [])] }
          : s
      )
    );
  };

  const handleDeleteSubjectResource = (id, resourceId) => {
    commitSubjects((prev) =>
      prev.map((s) =>
        s._id === id
          ? {
              ...s,
              resources: (s.resources || []).filter((r) => r._id !== resourceId),
            }
          : s
      )
    );
  };

  // Acciones de Tareas
  const handleCreateTask = (payload) => {
    const created = {
      _id: createId('task'),
      description: '',
      status: 'pendiente',
      priority: 'media',
      starred: false,
      dueDate: '',
      subjectCode: null,
      subjectName: '',
      ...payload,
    };
    setTasks((prev) => {
      const next = [created, ...prev];
      storageService.saveTasks(next);
      if (currentUser) {
        firestoreService.saveUserData(currentUser.uid, 'academic_data', { tasks: next });
      }
      refreshUsage();
      return next;
    });
  };

  const handleUpdateTask = (id, updates) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t._id === id ? { ...t, ...updates } : t));
      storageService.saveTasks(next);
      if (currentUser) {
        firestoreService.saveUserData(currentUser.uid, 'academic_data', { tasks: next });
      }
      return next;
    });
  };

  const handleCycleTaskStatus = (task) => {
    const nextOrder = {
      pendiente: 'en_progreso',
      en_progreso: 'completado',
      completado: 'pendiente',
    };
    handleUpdateTask(task._id, { status: nextOrder[task.status] || 'pendiente' });
  };

  const handleDeleteTask = (id) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t._id !== id);
      storageService.saveTasks(next);
      if (currentUser) {
        firestoreService.saveUserData(currentUser.uid, 'academic_data', { tasks: next });
      }
      refreshUsage();
      return next;
    });
  };

  // Acciones de Notas Rápidas
  const handleCreateNote = (payload) => {
    const created = {
      _id: createId('note'),
      color: 'violet',
      pinned: false,
      tag: 'General',
      ...payload,
    };
    setNotes((prev) => {
      const next = [created, ...prev];
      storageService.saveNotes(next);
      if (currentUser) {
        firestoreService.saveUserData(currentUser.uid, 'academic_data', { notes: next });
      }
      refreshUsage();
      return next;
    });
  };

  const handleUpdateNote = (id, updates) => {
    setNotes((prev) => {
      const next = prev.map((n) => (n._id === id ? { ...n, ...updates } : n));
      storageService.saveNotes(next);
      if (currentUser) {
        firestoreService.saveUserData(currentUser.uid, 'academic_data', { notes: next });
      }
      return next;
    });
  };

  const handleDeleteNote = (id) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n._id !== id);
      storageService.saveNotes(next);
      if (currentUser) {
        firestoreService.saveUserData(currentUser.uid, 'academic_data', { notes: next });
      }
      refreshUsage();
      return next;
    });
  };

  // Acciones de Agenda
  const handleCreateScheduleEvent = (payload) => {
    const created = {
      _id: createId('sched'),
      subtitle: '',
      type: 'clase',
      color: 'violet',
      subjectCode: null,
      ...payload,
    };
    setSchedule((prev) => {
      const next = [...prev, created].sort((a, b) =>
        `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)
      );
      storageService.saveSchedule(next);
      if (currentUser) {
        firestoreService.saveUserData(currentUser.uid, 'academic_data', { schedule: next });
      }
      refreshUsage();
      return next;
    });
  };

  const handleDeleteScheduleEvent = (id) => {
    setSchedule((prev) => {
      const next = prev.filter((e) => e._id !== id);
      storageService.saveSchedule(next);
      if (currentUser) {
        firestoreService.saveUserData(currentUser.uid, 'academic_data', { schedule: next });
      }
      refreshUsage();
      return next;
    });
  };

  // Acciones de Hábitos
  const handleCreateHabit = (payload) => {
    const created = {
      _id: createId('hab'),
      category: 'Estudio',
      color: 'violet',
      completedDates: [],
      targetDaysPerWeek: 5,
      ...payload,
    };
    setHabits((prev) => {
      const next = [...prev, created];
      storageService.saveHabits(next);
      if (currentUser) {
        firestoreService.saveUserData(currentUser.uid, 'academic_data', { habits: next });
      }
      refreshUsage();
      return next;
    });
  };

  const handleToggleHabitDate = (id, dateStr) => {
    setHabits((prev) => {
      const next = prev.map((h) => {
        if (h._id !== id) return h;
        const exists = (h.completedDates || []).includes(dateStr);
        const completedDates = exists
          ? h.completedDates.filter((d) => d !== dateStr)
          : [...(h.completedDates || []), dateStr];
        return { ...h, completedDates };
      });
      storageService.saveHabits(next);
      if (currentUser) {
        firestoreService.saveUserData(currentUser.uid, 'academic_data', { habits: next });
      }
      return next;
    });
  };

  const handleDeleteHabit = (id) => {
    setHabits((prev) => {
      const next = prev.filter((h) => h._id !== id);
      storageService.saveHabits(next);
      if (currentUser) {
        firestoreService.saveUserData(currentUser.uid, 'academic_data', { habits: next });
      }
      refreshUsage();
      return next;
    });
  };

  // ===============================================
  // GESTIÓN DE RESÚMENES Y ARTÍCULOS LARGOS
  // ===============================================
  const handleSaveSummary = async (summaryPayload) => {
    const docId = summaryPayload.id || `sum-${Date.now()}`;
    const cleanItem = {
      ...summaryPayload,
      id: docId,
      updatedAt: new Date().toISOString(),
      createdAt: summaryPayload.createdAt || new Date().toISOString(),
    };

    setSummaries((prev) => {
      const exists = prev.some((s) => s.id === docId);
      const next = exists
        ? prev.map((s) => (s.id === docId ? cleanItem : s))
        : [cleanItem, ...prev];
      localStorage.setItem('cyberdef_summaries_v1', JSON.stringify(next));
      return next;
    });

    if (currentUser) {
      try {
        await firestoreService.saveSummary(currentUser.uid, cleanItem);
      } catch (err) {
        console.warn('Error guardando resumen en Firestore:', err);
      }
    }
    return cleanItem;
  };

  const handleDeleteSummary = async (summaryId) => {
    setSummaries((prev) => {
      const next = prev.filter((s) => s.id !== summaryId);
      localStorage.setItem('cyberdef_summaries_v1', JSON.stringify(next));
      return next;
    });

    if (currentUser) {
      try {
        await firestoreService.deleteSummary(currentUser.uid, summaryId);
      } catch (err) {
        console.warn('Error eliminando resumen en Firestore:', err);
      }
    }
  };

  // Backup / Restore / Reset
  const handleExportBackup = () => storageService.exportBackupJSON();

  const handleImportBackup = (rawJson) => {
    const restored = storageService.importBackupJSON(rawJson);
    setSubjects(restored.subjects);
    setTasks(restored.tasks);
    setNotes(restored.notes);
    setSchedule(restored.schedule);
    setHabits(restored.habits);
    refreshUsage();
  };

  const handleResetAll = () => {
    const defaults = storageService.resetToDefaults();
    setSubjects(defaults.subjects);
    setTasks(defaults.tasks);
    setNotes(defaults.notes);
    setSchedule(defaults.schedule);
    setHabits(defaults.habits);
    refreshUsage();
  };

  const selectedSubject = useMemo(
    () => subjects.find((s) => s._id === selectedSubjectId) || null,
    [subjects, selectedSubjectId]
  );

  const academicStats = useMemo(() => {
    const degreeSubjects = subjects.filter((s) => s.year !== 0);
    const total = degreeSubjects.length || 37;
    const approved = degreeSubjects.filter((s) => s.status === 'aprobada');
    const inProgress = degreeSubjects.filter((s) => s.status === 'cursando');
    const totalHoursCompleted = approved.reduce((acc, s) => acc + (s.hours?.total || 0), 0);
    const basicApprovedHours = approved
      .filter((s) => s.cycle === 'Básico')
      .reduce((acc, s) => acc + (s.hours?.total || 0), 0);

    const graded = approved.filter((s) => typeof s.grade === 'number');
    const avgGrade =
      graded.length > 0
        ? (graded.reduce((acc, s) => acc + s.grade, 0) / graded.length).toFixed(2)
        : '—';

    const introSubjects = subjects.filter((s) => s.year === 0);
    const introApproved = introSubjects.filter((s) => s.status === 'aprobada').length;

    return {
      total,
      approvedCount: approved.length,
      inProgressCount: inProgress.length,
      totalHoursCompleted,
      totalDegreeHours: userProfile?.career?.totalHours || 2624,
      basicApprovedHours,
      intermediateHours: 1584,
      avgGrade,
      progressPct: Math.round((approved.length / total) * 100) || 0,
      introTotal: introSubjects.length,
      introApproved,
      introCompleted: introSubjects.length > 0 && introApproved === introSubjects.length,
    };
  }, [subjects, userProfile]);

  return (
    <AppDataContext.Provider
      value={{
        activeSection,
        setActiveSection,
        selectedSubject,
        setSelectedSubjectId,
        selectedDate,
        setSelectedDate,
        backupModalOpen,
        setBackupModalOpen,
        storageUsage,
        subjects,
        tasks,
        notes,
        schedule,
        habits,
        summaries,
        academicStats,
        // Pomodoro
        pomodoro: {
          modes: POMODORO_MODES,
          mode: pomoMode,
          secondsLeft,
          totalSeconds: POMODORO_MODES[pomoMode].minutes * 60,
          isRunning,
          setIsRunning,
          switchMode: switchPomoMode,
          reset: resetPomodoro,
          completedSessions,
        },
        // Handlers
        createSubject: handleCreateSubject,
        updateSubject: handleUpdateSubject,
        addSubjectNote: handleAddSubjectNote,
        updateSubjectNote: handleUpdateSubjectNote,
        deleteSubjectNote: handleDeleteSubjectNote,
        toggleSubjectUnit: handleToggleSubjectUnit,
        addSubjectUnit: handleAddSubjectUnit,
        deleteSubjectUnit: handleDeleteSubjectUnit,
        addSubjectImage: handleAddSubjectImage,
        deleteSubjectImage: handleDeleteSubjectImage,
        addSubjectRepo: handleAddSubjectRepo,
        deleteSubjectRepo: handleDeleteSubjectRepo,
        addSubjectResource: handleAddSubjectResource,
        deleteSubjectResource: handleDeleteSubjectResource,
        createTask: handleCreateTask,
        updateTask: handleUpdateTask,
        cycleTaskStatus: handleCycleTaskStatus,
        deleteTask: handleDeleteTask,
        createNote: handleCreateNote,
        updateNote: handleUpdateNote,
        deleteNote: handleDeleteNote,
        createScheduleEvent: handleCreateScheduleEvent,
        deleteScheduleEvent: handleDeleteScheduleEvent,
        createHabit: handleCreateHabit,
        toggleHabitDate: handleToggleHabitDate,
        deleteHabit: handleDeleteHabit,
        saveSummary: handleSaveSummary,
        deleteSummary: handleDeleteSummary,
        exportBackup: handleExportBackup,
        importBackup: handleImportBackup,
        resetAllData: handleResetAll,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData debe usarse dentro de AppDataProvider');
  return ctx;
};
