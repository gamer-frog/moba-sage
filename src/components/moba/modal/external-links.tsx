'use client';

import { ExternalLink, Info } from 'lucide-react';

interface ExternalLinksSectionProps {
  urls: { ugg: string; opgg: string; mobalytics: string };
  championName: string;
}

export function ExternalLinksSection({ urls, championName }: ExternalLinksSectionProps) {
  return (
    <div className="rounded-xl p-3" style={{ background: 'linear-gradient(135deg, rgba(200,170,110,0.08), rgba(200,170,110,0.03))', border: '1px solid rgba(200,170,110,0.2)' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#c8aa6e]" />
          <span className="text-[10px] font-semibold text-[#c8aa6e] uppercase tracking-wider">
            Fuentes Externas
          </span>
        </div>
      </div>
      <p className="text-[10px] text-[#785a28] mb-3">Links a builds siempre actualizados:</p>
      <div className="grid grid-cols-2 gap-2">
        <a href={urls.ugg} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105 hover:shadow-lg" style={{ background: 'rgba(0,203,230,0.12)', border: '1.5px solid rgba(0,203,230,0.35)', color: '#0acbe6', boxShadow: '0 0 12px rgba(0,203,230,0.08)' }}>
          <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black" style={{ background: 'rgba(0,203,230,0.2)', border: '1px solid rgba(0,203,230,0.3)' }}>UG</div>
          U.GG
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
        <a href={urls.opgg} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105 hover:shadow-lg" style={{ background: 'rgba(79,140,255,0.12)', border: '1.5px solid rgba(79,140,255,0.35)', color: '#4f8cff', boxShadow: '0 0 12px rgba(79,140,255,0.08)' }}>
          <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black" style={{ background: 'rgba(79,140,255,0.2)', border: '1px solid rgba(79,140,255,0.3)' }}>OP</div>
          OP.GG
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
        <a href={urls.mobalytics} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105 hover:shadow-lg" style={{ background: 'rgba(157,72,224,0.12)', border: '1.5px solid rgba(157,72,224,0.35)', color: '#9d48e0', boxShadow: '0 0 12px rgba(157,72,224,0.08)' }}>
          <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black" style={{ background: 'rgba(157,72,224,0.2)', border: '1px solid rgba(157,72,224,0.3)' }}>MA</div>
          Mobalytics
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
        <a href={`https://www.probuilds.net/champions/details/${championName.toLowerCase().replace(/ /g, '').replace(/'/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:scale-105 hover:shadow-lg" style={{ background: 'rgba(200,170,110,0.1)', border: '1.5px solid rgba(200,170,110,0.3)', color: '#c8aa6e', boxShadow: '0 0 12px rgba(200,170,110,0.06)' }}>
          <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black" style={{ background: 'rgba(200,170,110,0.2)', border: '1px solid rgba(200,170,110,0.3)' }}>PB</div>
          ProBuilds
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
      </div>
    </div>
  );
}
