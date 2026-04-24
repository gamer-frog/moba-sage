interface SourceBadgeProps {
  source?: string;
  timestamp?: string;
  patch?: string;
  size?: 'sm' | 'xs';
}

export function SourceBadge({ source, timestamp, patch, size = 'sm' }: SourceBadgeProps) {
  const isSmall = size === 'xs';

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleString('es-AR', {
        timeZone: 'America/Buenos_Aires',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className={`flex items-center gap-1.5 ${isSmall ? 'text-[9px]' : 'text-[10px]'} text-[#a09b8c]`}>
      {source && (
        <>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#c8aa6e]/10 text-[#c8aa6e] font-medium">
            {source}
          </span>
        </>
      )}
      {patch && (
        <span className="text-[#a09b8c]">
          {patch}
        </span>
      )}
      {formattedTime && (
        <span className="text-[#a09b8c]/70">
          · {formattedTime}
        </span>
      )}
    </div>
  );
}

export function RiotAttribution({ size = 'xs' }: { size?: 'sm' | 'xs' }) {
  const isSmall = size === 'xs';
  return (
    <p className={`text-[${isSmall ? '8' : '9'}px] text-[#a09b8c]/50 text-center mt-1`}>
      © Riot Games, Inc. League of Legends y todo el contenido son marcas de Riot Games, Inc.
    </p>
  );
}
