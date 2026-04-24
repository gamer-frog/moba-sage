'use client';

import { motion } from 'framer-motion';
import { Trophy, AlertTriangle, BookOpen, GraduationCap, MoreHorizontal } from 'lucide-react';

// 4 primary tabs + Más (sidebar)
const PRIMARY_BOTTOM_TABS = [
  { id: 'tierlist', label: 'Tier List', icon: Trophy },
  { id: 'broken', label: 'Rotas', icon: AlertTriangle },
  { id: 'guides', label: 'Guías', icon: BookOpen },
  { id: 'coaching', label: 'Coaching', icon: GraduationCap },
];

export function BottomNav({ activeTab, onTabChange, onOpenSidebar }: { activeTab: string; onTabChange: (tab: string) => void; onOpenSidebar?: () => void }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#785a28]/20"
      style={{ backgroundColor: 'rgba(10, 14, 26, 0.95)', backdropFilter: 'blur(20px) saturate(1.2)' }}>
      <div className="flex items-center justify-around px-2 py-1">
        {PRIMARY_BOTTOM_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all duration-200 min-w-[56px]
                ${isActive
                  ? 'text-[#c8aa6e]'
                  : 'text-[#5b5a56] active:text-[#a09b8c]'
                }
              `}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {isActive && (
                  <motion.div
                    layoutId="bottom-active-dot"
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full"
                    style={{ background: '#c8aa6e' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
        {/* Más button — opens sidebar drawer */}
        <button
          onClick={onOpenSidebar}
          className="
            flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all duration-200 min-w-[56px]
            text-[#5b5a56] active:text-[#a09b8c]
          "
          aria-label="Abrir menú lateral"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-medium">Más</span>
        </button>
      </div>
    </nav>
  );
}
