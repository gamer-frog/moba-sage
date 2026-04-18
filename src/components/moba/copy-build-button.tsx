'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyBuildButton({ buildName, itemsStr }: { buildName: string; itemsStr: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${buildName}: ${itemsStr}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  };
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-1 rounded text-[9px] font-medium transition-all hover:scale-105"
      style={{ background: copied ? 'rgba(15,186,129,0.15)' : 'rgba(200,170,110,0.08)', border: `1px solid ${copied ? 'rgba(15,186,129,0.3)' : 'rgba(200,170,110,0.15)'}`, color: copied ? '#0fba81' : '#785a28' }}
      title="Copiar build"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copiado!' : 'Copiar'}
    </button>
  );
}
