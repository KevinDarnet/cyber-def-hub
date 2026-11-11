import {
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
  isFirebaseConfigured,
} from './firebase';
import { getInitialSubjects, getInitialTasks, getInitialSchedule, getInitialHabits, getInitialNotes } from '../data/seedData';

/**
 * Plantilla oficial predeterminada de Licenciatura en Ciberdefensa (FADENA / UNDEF)
 */
export const DEFAULT_CAREER_TEMPLATE = {
  id: 'ciberdefensa-fadena',
  name: 'Licenciatura en Ciberdefensa',
  institution: 'FADENA / UNDEF',
  degreeType: 'Grado Universitario',
  totalHours: 2624,
  intermediateTitle: 'Analista Universitario en Gestión de Riesgos Cibernéticos (1584 hs)',
  isCustom: false,
};

/**
 * Plantilla semestral / anual genérica para cualquier carrera universitaria
 */
export const GENERIC_SEMESTER_TEMPLATE = {
  id: 'carrera-universitaria-generica',
  name: 'Grado Universitario (Plan Semestral)',
  institution: 'Universidad Nacional / Privada',
  degreeType: 'Grado Universitario',
  totalHours: 2048,
  intermediateTitle: 'Ciclo Básico Universitario (1024 hs)',
  isCustom: true,
};

export const getGenericSemesterSubjects = () => {
  const subjects = [];
  let code = 1;
  for (let year = 1; year <= 4; year++) {
    for (let sem = 1; sem <= 2; sem++) {
      const semesterNum = (year - 1) * 2 + sem;
      for (let s = 1; s <= 4; s++) {
        subjects.push({
          _id: `subj-gen-${code}`,
          code: code,
          name: `Materia ${code} (Semestre ${semesterNum})`,
          year: year,
          semester: sem,
          cycle: year <= 2 ? 'Ciclo Básico' : 'Ciclo Superior',
          category: s === 1 ? 'Matemáticas y Ciencias' : s === 2 ? 'Área Específica' : s === 3 ? 'Tecnología y Práctica' : 'Gestión y General',
          hours: { theory: 32, practice: 32, total: 64 },
          prerequisites: code > 4 ? [code - 4] : [],
          status: 'pendiente',
          grade: null,
          units: [
            { id: `u-${code}-1`, title: 'Unidad 1: Introducción y Fundamentos', completed: false },
            { id: `u-${code}-2`, title: 'Unidad 2: Aplicación y Práctica', completed: false },
          ],
          notes: [],
          images: [],
          githubRepos: [],
          resources: [],
        });
        code++;
      }
    }
  }
  return subjects;
};

export const firestoreService = {
  // Guardar o actualizar perfil del usuario y configuración de carrera
  async saveUserProfile(uid, profileData) {
    if (!isFirebaseConfigured || !db || !uid) return false;
    try {
      const userDocRef = doc(db, 'users', uid);
      const payload = {
        ...profileData,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, payload, { merge: true });

      // Persistir además explícitamente en el subdocumento careerConfig
      const careerConfig = profileData.careerConfig || profileData.career;
      if (careerConfig) {
        const configDocRef = doc(db, 'users', uid, 'data', 'careerConfig');
        await setDoc(
          configDocRef,
          {
            ...careerConfig,
            configuredAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
      return true;
    } catch (err) {
      console.warn('Error guardando perfil en Firestore:', err.message);
      return false;
    }
  },

  // Obtener perfil y carrera del usuario
  async getUserProfile(uid) {
    if (!isFirebaseConfigured || !db || !uid) return null;
    try {
      const userDocRef = doc(db, 'users', uid);
      const snapshot = await getDoc(userDocRef);
      let userData = snapshot.exists() ? snapshot.data() : null;

      // Comprobar si existe configuración de carrera en users/{uid}/data/careerConfig
      const configDocRef = doc(db, 'users', uid, 'data', 'careerConfig');
      const configSnap = await getDoc(configDocRef);
      if (configSnap.exists()) {
        const careerConfigData = configSnap.data();
        if (userData) {
          userData.career = userData.career || careerConfigData;
          userData.careerConfig = userData.careerConfig || careerConfigData;
          userData.onboardingCompleted = true;
        } else {
          userData = {
            uid,
            career: careerConfigData,
            careerConfig: careerConfigData,
            onboardingCompleted: true,
          };
        }
      }

      return userData;
    } catch (err) {
      console.warn('Error leyendo perfil de Firestore:', err.message);
      return null;
    }
  },

  // Inicializar usuario en Firestore durante el Onboarding
  async initializeUserCareer(uid, userData, careerData, initialSubjects = null) {
    if (!isFirebaseConfigured || !db || !uid) return false;
    try {
      const userDocRef = doc(db, 'users', uid);
      const profilePayload = {
        uid,
        email: userData.email || '',
        displayName: userData.displayName || 'Estudiante',
        photoURL: userData.photoURL || null,
        career: careerData,
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, profilePayload, { merge: true });

      // Si se seleccionó plantilla predefinida o materias iniciales
      const subjectsToLoad = initialSubjects || (careerData.isCustom ? [] : getInitialSubjects());
      await this.saveUserData(uid, 'academic_data', {
        subjects: subjectsToLoad,
        tasks: getInitialTasks(),
        schedule: getInitialSchedule(),
        habits: getInitialHabits(),
        notes: getInitialNotes(),
      });

      return true;
    } catch (err) {
      console.error('Error inicializando carrera en Firestore:', err);
      throw err;
    }
  },

  // Guardar documento consolidado del usuario (Materias, Tareas, etc.)
  async saveUserData(uid, dataKey, payload) {
    if (!isFirebaseConfigured || !db || !uid) return false;
    try {
      const docRef = doc(db, 'users', uid, 'data', dataKey);
      await setDoc(docRef, { ...payload, updatedAt: new Date().toISOString() }, { merge: true });
      return true;
    } catch (err) {
      console.warn(`Error guardando ${dataKey} en Firestore:`, err.message);
      return false;
    }
  },

  // Cargar datos consolidados del usuario
  async getUserData(uid, dataKey) {
    if (!isFirebaseConfigured || !db || !uid) return null;
    try {
      const docRef = doc(db, 'users', uid, 'data', dataKey);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data();
      }
      return null;
    } catch (err) {
      console.warn(`Error cargando ${dataKey} de Firestore:`, err.message);
      return null;
    }
  },

  // ==========================================
  // GESTIÓN DE RESÚMENES LARGOS (ARTÍCULOS)
  // Colección: users/{uid}/summaries
  // ==========================================

  async getSummaries(uid) {
    if (!isFirebaseConfigured || !db || !uid) return null;
    try {
      const summariesCol = collection(db, 'users', uid, 'summaries');
      const snapshot = await getDocs(summariesCol);
      const items = [];
      snapshot.forEach((docItem) => {
        items.push({ id: docItem.id, ...docItem.data() });
      });
      // Ordenar por fecha de actualización descendente
      items.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
      return items;
    } catch (err) {
      console.warn('Error leyendo resúmenes de Firestore:', err.message);
      return null;
    }
  },

  async saveSummary(uid, summary) {
    if (!isFirebaseConfigured || !db || !uid) return null;
    try {
      const docId = summary.id || `sum-${Date.now()}`;
      const docRef = doc(db, 'users', uid, 'summaries', docId);
      const payload = {
        ...summary,
        id: docId,
        updatedAt: new Date().toISOString(),
        createdAt: summary.createdAt || new Date().toISOString(),
      };
      await setDoc(docRef, payload, { merge: true });
      return payload;
    } catch (err) {
      console.error('Error guardando resumen en Firestore:', err);
      throw err;
    }
  },

  async deleteSummary(uid, summaryId) {
    if (!isFirebaseConfigured || !db || !uid) return false;
    try {
      const docRef = doc(db, 'users', uid, 'summaries', summaryId);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.error('Error eliminando resumen en Firestore:', err);
      return false;
    }
  },
};
