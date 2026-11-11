import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  isFirebaseConfigured,
} from '../services/firebase';
import { firestoreService, DEFAULT_CAREER_TEMPLATE } from '../services/db';
import { storageService } from '../services/storageService';
import {
  getInitialSubjects,
  getInitialTasks,
  getInitialSchedule,
  getInitialHabits,
  getInitialNotes,
} from '../data/seedData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const cached =
        localStorage.getItem('cyberdef_user_profile') ||
        localStorage.getItem('studyhub_user_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Estados explícitos de carga
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Escuchar cambios de autenticación reactivos EXCLUSIVAMENTE desde Firebase
  useEffect(() => {
    // Limpieza de flags obsoletos
    localStorage.removeItem('cyberdef_guest_mode');
    localStorage.removeItem('cyberdef_local_user');

    if (!isFirebaseConfigured || !auth) {
      console.warn('Firebase no está configurado. La autenticación permanecerá a la espera de credenciales válidas en .env.');
      setIsAuthLoading(false);
      setIsProfileLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        setUserProfile(null);
        localStorage.removeItem('cyberdef_user_profile');
        localStorage.removeItem('studyhub_user_profile');
        setIsProfileLoading(false);
        setIsAuthLoading(false);
        return;
      }

      // Usuario autenticado en Firebase -> activamos ambos estados de carga
      setIsAuthLoading(true);
      setIsProfileLoading(true);

      try {
        const profile = await firestoreService.getUserProfile(firebaseUser.uid);

        // Si ya tiene una carrera configurada, marcar onboarding completo y guardar perfil
        if (profile && (profile.career?.name || profile.careerConfig?.name || profile.career)) {
          const resolvedCareer = profile.career || profile.careerConfig;
          const fullProfile = {
            ...profile,
            uid: firebaseUser.uid,
            displayName: profile.displayName || firebaseUser.displayName || 'Estudiante',
            email: firebaseUser.email || profile.email || '',
            career: resolvedCareer,
            careerConfig: resolvedCareer,
            onboardingCompleted: true,
          };
          setUserProfile(fullProfile);
          localStorage.setItem('cyberdef_user_profile', JSON.stringify(fullProfile));
          localStorage.setItem('studyhub_user_profile', JSON.stringify(fullProfile));
        } else {
          // Si en Firestore aún no tiene carrera configurada pero en localStorage tenemos uno previo para este mismo UID
          let cached = null;
          try {
            const raw =
              localStorage.getItem('cyberdef_user_profile') ||
              localStorage.getItem('studyhub_user_profile');
            if (raw) cached = JSON.parse(raw);
          } catch {}

          if (
            cached &&
            cached.uid === firebaseUser.uid &&
            (cached.career?.name || cached.careerConfig?.name)
          ) {
            const resolvedCareer = cached.career || cached.careerConfig;
            const fullProfile = {
              ...cached,
              career: resolvedCareer,
              careerConfig: resolvedCareer,
              onboardingCompleted: true,
            };
            setUserProfile(fullProfile);
            firestoreService.saveUserProfile(firebaseUser.uid, fullProfile).catch(console.warn);
          } else {
            // Usuario nuevo sin carrera configurada
            const cleanDisplayName =
              firebaseUser.displayName?.trim() ||
              firebaseUser.email?.split('@')[0] ||
              'Estudiante';

            const newProfile = {
              uid: firebaseUser.uid,
              displayName: cleanDisplayName,
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || null,
              career: null,
              careerConfig: null,
              onboardingCompleted: false,
              createdAt: profile?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            await firestoreService.saveUserProfile(firebaseUser.uid, newProfile);
            setUserProfile(newProfile);
            localStorage.setItem('cyberdef_user_profile', JSON.stringify(newProfile));
            localStorage.setItem('studyhub_user_profile', JSON.stringify(newProfile));
          }
        }
      } catch (err) {
        console.warn('Error al verificar o inicializar perfil de usuario en Firestore:', err);
        // Fallback a perfil en caché si coincide con este usuario
        let cached = null;
        try {
          const raw =
            localStorage.getItem('cyberdef_user_profile') ||
            localStorage.getItem('studyhub_user_profile');
          if (raw) cached = JSON.parse(raw);
        } catch {}
        if (cached && cached.uid === firebaseUser.uid) {
          setUserProfile(cached);
        }
      } finally {
        // Establecer el usuario autenticado y liberar flags de carga JUNTOS
        setCurrentUser(firebaseUser);
        setIsProfileLoading(false);
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Inicio con Google Popup (Requiere Firebase Auth real)
  const loginWithGoogle = async () => {
    setAuthError(null);
    setIsProfileLoading(true);
    setIsAuthLoading(true);

    if (!isFirebaseConfigured || !auth || !googleProvider) {
      const msg = 'Firebase no está configurado. Por favor, añade las claves de tu proyecto en el archivo .env para habilitar Google Authentication.';
      setAuthError(msg);
      setIsProfileLoading(false);
      setIsAuthLoading(false);
      throw new Error(msg);
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      setIsProfileLoading(false);
      setIsAuthLoading(false);
      setAuthError(err.message);
      throw err;
    }
  };

  // Inicio con Email y Contraseña (Requiere Firebase Auth real)
  const loginWithEmail = async (email, password) => {
    setAuthError(null);
    setIsProfileLoading(true);
    setIsAuthLoading(true);

    if (!isFirebaseConfigured || !auth) {
      const msg = 'Firebase no está configurado. Por favor, añade las claves de tu proyecto en el archivo .env para iniciar sesión.';
      setAuthError(msg);
      setIsProfileLoading(false);
      setIsAuthLoading(false);
      throw new Error(msg);
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err) {
      setIsProfileLoading(false);
      setIsAuthLoading(false);
      setAuthError(err.message);
      throw err;
    }
  };

  // Registro con Email, Contraseña y Nombre (Requiere Firebase Auth real)
  const registerWithEmail = async (email, password, displayName) => {
    setAuthError(null);
    setIsProfileLoading(true);
    setIsAuthLoading(true);

    if (!isFirebaseConfigured || !auth) {
      const msg = 'Firebase no está configurado. Por favor, añade las claves de tu proyecto en el archivo .env para registrar usuarios.';
      setAuthError(msg);
      setIsProfileLoading(false);
      setIsAuthLoading(false);
      throw new Error(msg);
    }

    const cleanName = displayName?.trim() || email.split('@')[0];

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      if (cleanName && user) {
        await updateProfile(user, { displayName: cleanName });
      }

      // Crear documento del usuario en Firestore a la espera del Onboarding
      const newProfile = {
        uid: user.uid,
        displayName: cleanName,
        email: user.email,
        career: null,
        careerConfig: null,
        onboardingCompleted: false,
        createdAt: new Date().toISOString(),
      };
      await firestoreService.saveUserProfile(user.uid, newProfile);
      setUserProfile(newProfile);
      localStorage.setItem('cyberdef_user_profile', JSON.stringify(newProfile));
      localStorage.setItem('studyhub_user_profile', JSON.stringify(newProfile));

      return user;
    } catch (err) {
      setIsProfileLoading(false);
      setIsAuthLoading(false);
      setAuthError(err.message);
      throw err;
    }
  };

  // Actualizar Nombre de Estudiante (Callsign)
  const updateUserDisplayName = async (newName) => {
    if (!newName || !newName.trim()) return;
    const cleanName = newName.trim();

    if (currentUser && auth?.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName: cleanName });
        setCurrentUser({ ...auth.currentUser, displayName: cleanName });
      } catch (e) {
        console.warn('Error actualizando perfil en Firebase Auth:', e);
      }
    }

    const updatedProfile = {
      ...(userProfile || {}),
      displayName: cleanName,
      updatedAt: new Date().toISOString(),
    };
    setUserProfile(updatedProfile);
    localStorage.setItem('cyberdef_user_profile', JSON.stringify(updatedProfile));
    localStorage.setItem('studyhub_user_profile', JSON.stringify(updatedProfile));

    if (currentUser?.uid && isFirebaseConfigured) {
      try {
        await firestoreService.saveUserProfile(currentUser.uid, updatedProfile);
      } catch (e) {
        console.warn('Error guardando nombre en Firestore:', e);
      }
    }
  };

  // Finalizar Onboarding y persistir carrera elegida
  const completeOnboarding = async (career, customSubjects = null) => {
    const updatedProfile = {
      ...(userProfile || {}),
      uid: currentUser?.uid,
      displayName: currentUser?.displayName || userProfile?.displayName || 'Estudiante',
      email: currentUser?.email || userProfile?.email || '',
      career,
      careerConfig: career,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    };

    const finalSubjects = Array.isArray(customSubjects) ? customSubjects : getInitialSubjects();

    if (currentUser?.uid && isFirebaseConfigured) {
      try {
        await firestoreService.saveUserProfile(currentUser.uid, updatedProfile);
        await firestoreService.saveUserData(currentUser.uid, 'academic_data', {
          subjects: finalSubjects,
          tasks: career.isCustom ? [] : getInitialTasks(),
          schedule: career.isCustom ? [] : getInitialSchedule(),
          habits: career.isCustom ? [] : getInitialHabits(),
          notes: career.isCustom ? [] : getInitialNotes(),
        });
      } catch (e) {
        console.warn('Error guardando carrera en Firestore:', e);
      }
    }

    setUserProfile(updatedProfile);
    localStorage.setItem('cyberdef_user_profile', JSON.stringify(updatedProfile));
    localStorage.setItem('studyhub_user_profile', JSON.stringify(updatedProfile));
    storageService.saveSubjects(finalSubjects);
    if (career.isCustom && finalSubjects.length === 0) {
      storageService.saveTasks([]);
      storageService.saveNotes([]);
      storageService.saveSchedule([]);
      storageService.saveHabits([]);
    }

    // Notificar al contexto de datos de la aplicación
    window.dispatchEvent(
      new CustomEvent('cyberdef_career_updated', {
        detail: { subjects: finalSubjects, career },
      })
    );
    window.dispatchEvent(
      new CustomEvent('studyhub_career_updated', {
        detail: { subjects: finalSubjects, career },
      })
    );

    return updatedProfile;
  };

  // Cerrar sesión
  const logout = async () => {
    if (auth && isFirebaseConfigured) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.warn('Error en signout:', e);
      }
    }
    setCurrentUser(null);
    setUserProfile(null);
    localStorage.removeItem('cyberdef_user_profile');
    localStorage.removeItem('studyhub_user_profile');
    localStorage.removeItem('cyberdef_local_user');
    localStorage.removeItem('cyberdef_guest_mode');
    localStorage.removeItem('cyberdef_os_subjects_v4');
    localStorage.removeItem('cyberdef_summaries_v1');
  };

  // Estado unificado de carga de Auth y Perfil Firestore
  const isAppLoading = Boolean(isAuthLoading || isProfileLoading);

  // Verificación estricta de carrera configurada
  const hasCareerConfigured = Boolean(
    userProfile?.career?.name ||
    userProfile?.careerConfig?.name ||
    (typeof userProfile?.career === 'string' && userProfile.career.trim() !== '') ||
    userProfile?.onboardingCompleted === true
  );

  // Ruteo condicional estricto: Onboarding SOLO si la carga terminó por completo,
  // el usuario está autenticado y se confirmó inequívocamente que NO tiene carrera.
  const needsOnboarding = Boolean(
    !isAppLoading && currentUser && !hasCareerConfigured
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAuthLoading,
        loadingAuth: isAuthLoading, // Alias para compatibilidad
        isProfileLoading,
        isLoading: isAppLoading,
        isAppLoading,
        authError,
        isFirebaseConfigured,
        hasCareerConfigured,
        needsOnboarding,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        updateUserDisplayName,
        completeOnboarding,
        logout,
        setUserProfile,
        setIsProfileLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
  }
  return context;
};
