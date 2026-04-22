'use client';

import { TAB_ITEMS, DEV_TAB_IDS } from './constants';
import { Wrench } from 'lucide-react';

export function TabNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  let devSeparatorShown = false;

  return (
    <nav className="sticky top-[57px] z-30 border-b border-[#785a28]/15" style={{ backgroundColor: 'rgba(10, 14, 26, 0.9)', backdropFilter: 'blur(16px)' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none" role="tablist" aria-label="Navegación de pestañas">
          {TAB_ITEMS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDev = DEV_TAB_IDS.has(tab.id);
            const showSeparator = isDev && !devSeparatorShown;
            if (isDev && !devSeparatorShown) devSeparatorShown = true;

            return (
              <div key={tab.id} className="flex items-center shrink-0">
                {showSeparator && (
                  <div className="flex items-center gap-1 px-2 text-[#5b5a56]">
                    <div className="w-px h-4 bg-[#785a28]/30" />
                    <Wrench className="w-2.5 h-2.5" />
                    <div className="w-px h-4 bg-[#785a28]/30" />
                  </div>
                )}
                <button
                  onClick={() => onTabChange(tab.id)}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200
                    ${isActive
                      ? isDev
                        ? 'bg-[#0acbe6]/12 text-[#0acbe6] border border-[#0acbe6]/25 shadow-[0_0_12px_rgba(10,203,230,0.08)]'
                        : 'bg-[#c8aa6e]/12 text-[#c8aa6e] border border-[#c8aa6e]/25 shadow-[0_0_12px_rgba(200,170,110,0.08)]'
                      : isDev
                        ? 'text-[#5b5a56] hover:text-[#0acbe6] hover:bg-[#0acbe6]/5 border border-transparent'
                        : 'text-[#5b5a56] hover:text-[#a09b8c] hover:bg-[#1e2328]/40 border border-transparent'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
