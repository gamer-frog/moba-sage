'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('MOBA SAGE Route Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ backgroundColor: '#0a0e1a' }}>
      <div className="text-center max-w-md">
        {/* Error icon with glow */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{
            background: 'rgba(232,64,87,0.08)',
            border: '1.5px solid rgba(232,64,87,0.2)',
            boxShadow: '0 0 40px rgba(232,64,87,0.1)',
          }}
        >
          <AlertTriangle className="w-10 h-10 text-lol-danger" />
        </div>

        <h1
          className="text-2xl font-black mb-2 lol-heading"
          style={{ color: '#c8aa6e', textShadow: '0 0 20px rgba(200,170,110,0.2)' }}
        >
          ¡Error en el Invocador!
        </h1>
        <p className="text-sm mb-8" style={{ color: '#a09b8c' }}>
          Algo salió mal en la Grieta del Invocador. Intentá recargar o volvé al inicio.
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #c8aa6e, #785a28)',
              color: '#0a0e1a',
              boxShadow: '0 0 20px rgba(200,170,110,0.2)',
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
            style={{
              background: 'rgba(30,35,40,0.6)',
              color: '#a09b8c',
              border: '1px solid rgba(120,90,40,0.2)',
            }}
          >
            <WifiOff className="w-4 h-4" />
            Ir al Inicio
          </button>
        </div>

        {/* Error details (collapsed) */}
        {error.message && (
          <details className="mt-8 text-left">
            <summary className="text-[10px] text-lol-dim cursor-pointer hover:text-lol-muted transition-colors">
              Detalles del error
            </summary>
            <pre
              className="mt-2 text-[10px] p-3 rounded-lg overflow-auto max-h-32"
              style={{
                backgroundColor: '#1e2328',
                color: '#785a28',
                border: '1px solid rgba(120,90,40,0.15)',
              }}
            >
              {error.message}
              {error.digest && `\n\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
