'use client';

import { useState } from 'react';
import { getItemIconUrl } from './helpers';

export function ItemIcon({ name }: { name: string }) {
  const url = getItemIconUrl(name);
  const [err, setErr] = useState(false);
  if (!url || err) return <div className="w-6 h-6 rounded bg-[#1e2328] flex items-center justify-center text-[8px] text-[#5b5a56] border border-[#785a28]/20 shrink-0">{name[0]}</div>;
  return <img src={url} alt={name} className="w-6 h-6 rounded shrink-0" style={{ border: '1px solid rgba(200,170,110,0.15)' }} loading="lazy" onError={() => setErr(true)} />;
}
