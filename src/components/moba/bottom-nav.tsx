'use client';

import { motion } from 'framer-motion';
import { Trophy, ScrollText, Flame, GraduationCap, GitCompare, User, MoreHorizontal } from 'lucide-react';

// 7 primary tabs — key features always accessible on mobile
const PRIMARY_BOTTOM_TABS = [
  { id: 'tierlist', label: 'Tier List', icon: Trophy },
  { id: 'patches', label: 'Meta', icon: ScrollText },
  { id: 'combos', label: 'Combos', icon: Flame },
  { id: 'comparison', label: 'Comparar', icon: GitCompare },
  { id: 'coaching', label: 'Coaching', icon: GraduationCap },
  { id: 'profile', label: 'Perfil', icon: User },
];

export function BottomNav({ activeTab, onTabChange, onOpenSidebar }: { activeTab: string; onTabChange: (tab: string) => void; onOpenSidebar?: () => void }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#785a28]/20 safe-bottom"
      style={{ backgroundColor: 'rgba(10, 14, 26, 0.95)', backdropFilter: 'blur(20px) saturate(1.2)' }}>
      <div className="flex items-center justify-around px-1 py-1">
        {PRIMARY_BOTTOM_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex flex-col items-center gap-0 px-2 py-2 rounded-lg transition-all duration-200
                min-w-[48px] min-h-[44px] sm:min-h-[48px]
                ${isActive
                  ? 'text-[#c8aa6e]'
                  : 'text-[#5b5a56] active:text-[#a09b8c]'
                }
              `}
            >
              <div className="relative">
                <Icon className="w-[18px] h-[18px]" />
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
            flex flex-col items-center gap-0 px-2 py-2 rounded-lg transition-all duration-200
            min-w-[48px] min-h-[44px] sm:min-h-[48px]
            text-[#5b5a56] active:text-[#a09b8c]
          "
          aria-label="Abrir menú lateral"
        >
          <MoreHorizontal className="w-[18px] h-[18px]" />
          <span className="text-[10px] font-medium">Más</span>
        </button>
      </div>
    </nav>
  );
}
