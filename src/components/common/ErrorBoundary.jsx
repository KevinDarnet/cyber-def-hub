import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CyberDefHub ErrorBoundary capturó un error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    localStorage.removeItem('cyberdef_guest_mode');
    localStorage.removeItem('cyberdef_local_user');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="os-backdrop flex min-h-screen min-h-[100dvh] w-full items-center justify-center p-4">
          <div className="glass-card max-w-lg border-rose-500/40 p-6 sm:p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
              Algo no salió como se esperaba
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
              CyberDefHub detectó un error inesperado al renderizar la interfaz.
            </p>

            {this.state.error?.message && (
              <div className="my-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-left font-mono text-xs text-rose-300 overflow-x-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="os-btn-primary px-4 py-2 text-xs font-bold"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Recargar Aplicación</span>
              </button>

              <button
                onClick={this.handleReset}
                className="os-btn-ghost rounded-xl border border-slate-300 bg-white/40 px-4 py-2 text-xs font-semibold dark:border-white/10 dark:bg-white/[0.04]"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Volver al Inicio</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
