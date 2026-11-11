import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield } from 'lucide-react';

export const LoadingScreen = () => (
  <div className="os-backdrop flex min-h-screen min-h-[100dvh] w-full items-center justify-center p-4">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-2xl bg-violet-600/20" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-500 text-white shadow-neon-purple">
          <Shield className="h-6 w-6" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="font-mono text-xs font-bold tracking-widest text-violet-400">
          INICIALIZANDO CYBERDEFHUB...
        </p>
        <p className="text-[11px] text-slate-400">
          Verificando credenciales y perfil académico en la nube
        </p>
      </div>
    </div>
  </div>
);

export const ProtectedRoute = ({ children }) => {
  const {
    currentUser,
    isAuthLoading,
    isProfileLoading,
    isAppLoading,
    hasCareerConfigured,
  } = useAuth();
  const location = useLocation();

  if (isAuthLoading || isProfileLoading || isAppLoading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!hasCareerConfigured) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export const PublicOnlyRoute = ({ children }) => {
  const {
    currentUser,
    isAuthLoading,
    isProfileLoading,
    isAppLoading,
    hasCareerConfigured,
  } = useAuth();

  if (isAuthLoading || isProfileLoading || isAppLoading) {
    return <LoadingScreen />;
  }

  if (currentUser) {
    return hasCareerConfigured ? (
      <Navigate to="/dashboard" replace />
    ) : (
      <Navigate to="/onboarding" replace />
    );
  }

  return children;
};

export const OnboardingRoute = ({ children }) => {
  const {
    currentUser,
    isAuthLoading,
    isProfileLoading,
    isAppLoading,
    hasCareerConfigured,
  } = useAuth();

  if (isAuthLoading || isProfileLoading || isAppLoading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (hasCareerConfigured) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
