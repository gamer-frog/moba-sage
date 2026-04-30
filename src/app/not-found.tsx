import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ backgroundColor: '#0a0e1a' }}>
      <div className="text-center max-w-md">
        {/* 404 icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{
            background: 'rgba(200,170,110,0.08)',
            border: '1.5px solid rgba(200,170,110,0.2)',
            boxShadow: '0 0 40px rgba(200,170,110,0.1)',
          }}
        >
          <span className="text-3xl font-black" style={{ color: '#c8aa6e' }}>404</span>
        </div>

        <h1
          className="text-2xl font-black mb-2 lol-heading"
          style={{ color: '#c8aa6e', textShadow: '0 0 20px rgba(200,170,110,0.2)' }}
        >
          Campeón No Encontrado
        </h1>
        <p className="text-sm mb-8" style={{ color: '#a09b8c' }}>
          Esta ruta no existe en la Grieta del Invocador. Volvé al inicio para continuar.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #c8aa6e, #785a28)',
            color: '#0a0e1a',
            boxShadow: '0 0 20px rgba(200,170,110,0.2)',
          }}
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
