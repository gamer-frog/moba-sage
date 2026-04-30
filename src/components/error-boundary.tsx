'use client';

import { Component, type ReactNode } from 'react';
import { Sword } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MOBA SAGE Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ backgroundColor: '#0a0e1a' }}>
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c8aa6e, #785a28)', boxShadow: '0 0 30px rgba(200,170,110,0.3)' }}>
              <Sword className="w-8 h-8 text-[#0a0e1a]" />
            </div>
            <h1
              className="text-3xl font-black mb-3 lol-heading"
              style={{ color: '#c8aa6e', textShadow: '0 0 30px rgba(200,170,110,0.3)' }}
            >
              ¡Error en el Invocador!
            </h1>
            <p className="text-sm mb-6" style={{ color: '#a09b8c' }}>
              Algo salió mal en la Grieta del Invocador. Intentá recargar la página.
            </p>
            {this.state.error && (
              <pre className="text-[10px] p-3 rounded-lg mb-6 overflow-auto max-h-32 text-left" style={{ backgroundColor: '#1e2328', color: '#785a28', border: '1px solid rgba(200,170,110,0.15)' }}>
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #c8aa6e, #785a28)', color: '#0a0e1a' }}
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
