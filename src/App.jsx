import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';

import DashboardLayout from './components/layout/DashboardLayout';
import {
  ProtectedRoute,
  PublicOnlyRoute,
  OnboardingRoute,
} from './components/auth/ProtectedRoute';

import LandingPage from './components/landing/LandingPage';
import LoginPage from './components/views/LoginPage';
import OnboardingPage from './components/views/OnboardingPage';

import DashboardView from './components/views/DashboardView';
import AcademicHubView from './components/views/AcademicHubView';
import SummariesCenterView from './components/views/SummariesCenterView';
import CalendarScheduleView from './components/views/CalendarScheduleView';
import TaskManagerView from './components/views/TaskManagerView';
import FocusHabitsView from './components/views/FocusHabitsView';
import NotesVaultView from './components/views/NotesVaultView';

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppDataProvider>
            <Routes>
              {/* Rutas Públicas */}
              <Route
                path="/"
                element={
                  <PublicOnlyRoute>
                    <LandingPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />

              {/* Ruta de Onboarding */}
              <Route
                path="/onboarding"
                element={
                  <OnboardingRoute>
                    <OnboardingPage />
                  </OnboardingRoute>
                }
              />

              {/* Rutas Privadas / Protegidas en DashboardLayout */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardView />} />
                <Route path="/plan" element={<AcademicHubView />} />
                <Route path="/resumenes" element={<SummariesCenterView />} />
                <Route path="/articulos" element={<SummariesCenterView />} />
                <Route path="/agenda" element={<CalendarScheduleView />} />
                <Route path="/calendario" element={<CalendarScheduleView />} />
                <Route path="/tareas" element={<TaskManagerView />} />
                <Route path="/focus" element={<FocusHabitsView />} />
                <Route path="/notas" element={<NotesVaultView />} />

                {/* Aliases de compatibilidad */}
                <Route path="/academic" element={<Navigate to="/plan" replace />} />
                <Route path="/calendar" element={<Navigate to="/agenda" replace />} />
                <Route path="/tasks" element={<Navigate to="/tareas" replace />} />
                <Route path="/notes" element={<Navigate to="/notas" replace />} />
                <Route path="/summaries" element={<Navigate to="/resumenes" replace />} />
              </Route>

              {/* Ruta comodín */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
