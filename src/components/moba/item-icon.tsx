'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getItemIconUrl } from './helpers';

export function ItemIcon({ name, size = 24 }: { name: string; size?: number }) {
  const url = getItemIconUrl(name);
  const [err, setErr] = useState(false);
  if (!url || err) return <div className="shrink-0 rounded bg-lol-card flex items-center justify-center border border-lol-gold-dark/20" style={{ width: size, height: size, fontSize: size * 0.4 }}><span className="text-lol-dim">{name[0]}</span></div>;
  return <Image src={url} alt={name} width={size} height={size} className="rounded shrink-0" style={{ width: size, height: size, border: '1px solid rgba(200,170,110,0.15)' }} loading="lazy" onError={() => setErr(true)} />;
}
