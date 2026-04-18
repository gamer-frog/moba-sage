'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getRuneIconUrl } from './helpers';

interface RuneIconProps {
  runeName: string;
  size?: number;
  className?: string;
}

export function RuneIcon({ runeName, size = 24, className = '' }: RuneIconProps) {
  const runeInfo = getRuneIconUrl(runeName);
  const [imgError, setImgError] = useState(false);

  if (runeInfo?.url && !imgError) {
    return (
      <Image
        src={runeInfo.url}
        alt={runeName}
        width={size}
        height={size}
        className={`rounded shrink-0 ${className}`}
        style={{ border: '1px solid rgba(200,170,110,0.2)' }}
        onError={() => setImgError(true)}
        loading="lazy"
      />
    );
  }

  // Fallback: colored circle with rune path initial
  const color = runeInfo?.color || '#c8aa6e';
  const initial = (runeName.split('—')[0].trim() || 'R')[0];

  return (
    <div
      className={`rounded shrink-0 flex items-center justify-center font-bold ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color + '20',
        border: `1px solid ${color}40`,
        color,
        fontSize: size * 0.45,
      }}
      title={runeName}
    >
      {initial}
    </div>
  );
}
