export default function Loading() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: '#070b14' }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 40%, rgba(200,170,110,0.06) 0%, transparent 60%)' }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Spinner */}
        <div className="relative mb-8">
          <div
            className="w-14 h-14 rounded-full"
            style={{
              border: '2px solid rgba(200,170,110,0.1)',
              borderTopColor: '#c8aa6e',
              animation: 'spin 1s linear infinite',
            }}
          />
          <div
            className="absolute inset-0 w-14 h-14 rounded-full"
            style={{
              border: '2px solid transparent',
              borderBottomColor: 'rgba(10,203,230,0.4)',
              animation: 'spin 1.5s linear infinite reverse',
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
            style={{
              background: '#c8aa6e',
              boxShadow: '0 0 12px rgba(200,170,110,0.4)',
            }}
          />
        </div>

        {/* Title */}
        <h1
          className="text-2xl font-black tracking-[0.2em] mb-2"
          style={{
            color: '#c8aa6e',
            fontFamily: 'var(--font-cinzel), serif',
            textShadow: '0 0 25px rgba(200,170,110,0.2)',
          }}
        >
          MOBA SAGE
        </h1>

        {/* Loading bar */}
        <div className="w-48 h-[2px] rounded-full overflow-hidden mt-4" style={{ background: 'rgba(200,170,110,0.08)' }}>
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #785a28, #c8aa6e, #785a28)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s linear infinite',
            }}
          />
        </div>

        <p className="text-[10px] mt-4 tracking-widest uppercase" style={{ color: '#5b5a56' }}>
          Cargando...
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>
    </div>
  );
}
