'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function CollapsibleSection({ title, icon: Icon, color, children, defaultOpen = true }: {
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 mb-2 w-full text-left group"
      >
        <Icon className="w-4 h-4" style={{ color }} />
        <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>{title}</h4>
        <ChevronDown className={`w-3 h-3 ml-auto transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`} style={{ color: `${color}80` }} />
      </button>
      <div className={`lol-collapsible-content ${isOpen ? 'expanded' : 'collapsed'}`}>
        {children}
      </div>
    </div>
  );
}
