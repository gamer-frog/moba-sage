'use client';

import { useState, memo } from 'react';
import Image from 'next/image';
import { TIER_CONFIG } from './constants';
import { getChampionImageUrl } from './helpers';

export const ChampionIcon = memo(function ChampionIcon({ name, tier }: { name: string; tier: string }) {
  const cfg = TIER_CONFIG[tier];
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="w-11 h-11 rounded-full overflow-hidden shrink-0 relative"
      style={{
        border: `2.5px solid ${cfg.color}70`,
        boxShadow: `0 0 12px ${cfg.color}25, inset 0 0 6px ${cfg.color}10`,
      }}
    >
      {!imgError ? (
        <Image
          src={getChampionImageUrl(name)}
          alt={name}
          width={44}
          height={44}
          className="w-full h-full object-cover"
          loading="lazy"
          unoptimized
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
        >
          {name[0]}
        </div>
      )}
    </div>
  );
});

export const SmallChampionIcon = memo(function SmallChampionIcon({ name }: { name: string }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div
      className="w-10 h-10 rounded-full overflow-hidden shrink-0"
      style={{ border: '2px solid rgba(120,90,40,0.25)' }}
    >
      {!imgError ? (
        <Image
          src={getChampionImageUrl(name)}
          alt={name}
          width={40}
          height={40}
          className="w-full h-full object-cover"
          loading="lazy"
          unoptimized
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-[#1e2328] text-[#a09b8c]">
          {name[0]}
        </div>
      )}
    </div>
  );
});

export const SplashArtIcon = memo(function SplashArtIcon({ name }: { name: string }) {
  const [imgError, setImgError] = useState(false);
  return (
    !imgError ? (
      <Image
        src={getChampionImageUrl(name)}
        alt={name}
        fill
        className="w-full h-full object-cover"
        sizes="(max-width: 768px) 100vw, 512px"
        loading="lazy"
        unoptimized
        onError={() => setImgError(true)}
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-lg font-black" style={{ backgroundColor: 'rgba(200,170,110,0.15)', color: '#c8aa6e' }}>
        {name[0]}
      </div>
    )
  );
});

export const TinyChampionIcon = memo(function TinyChampionIcon({ name }: { name: string }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div
      className="w-8 h-8 rounded-full overflow-hidden shrink-0"
      style={{ border: '2px solid rgba(120,90,40,0.3)' }}
    >
      {!imgError ? (
        <Image
          src={getChampionImageUrl(name)}
          alt={name}
          width={32}
          height={32}
          className="w-full h-full object-cover"
          loading="lazy"
          unoptimized
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold bg-[#1e2328] text-[#a09b8c]">
          {name[0]}
        </div>
      )}
    </div>
  );
});
