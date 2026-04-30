'use client';

import { motion } from 'framer-motion';
import { getChampionSplashUrl } from '../helpers';
import { SKIN_VARIANTS, getSkinLabel } from '@/data/champion-data';

interface SkinGalleryProps {
  championName: string;
  activeSkin: number;
  failedSkins: Set<number>;
  tierColor: string;
  onSelectSkin: (skinNum: number) => void;
  onSkinError: (skinNum: number) => void;
}

export function SkinGallery({ championName, activeSkin, failedSkins, tierColor, onSelectSkin, onSkinError }: SkinGalleryProps) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(20,24,30,0.5)', border: '1px solid rgba(120,90,40,0.12)' }}>
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-2">
        {SKIN_VARIANTS.map((skinNum) => {
          const splashUrl = getChampionSplashUrl(championName, skinNum);
          const isFailed = failedSkins.has(skinNum);
          const isActive = activeSkin === skinNum;

          return (
            <motion.button
              key={skinNum}
              onClick={() => onSelectSkin(skinNum)}
              className="relative shrink-0 rounded-lg overflow-hidden cursor-pointer"
              style={{
                width: 100,
                height: 56,
                border: isActive
                  ? `2px solid ${tierColor}`
                  : '2px solid rgba(120,90,40,0.15)',
                boxShadow: isActive
                  ? `0 0 14px ${tierColor}50`
                  : 'none',
                opacity: isFailed ? 0.3 : 1,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isFailed}
              aria-label={getSkinLabel(championName, skinNum)}
            >
              {!isFailed ? (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${splashUrl})`, filter: 'brightness(0.6) saturate(1.2)' }}
                >
                  <img src={splashUrl} alt="" className="hidden" onError={() => onSkinError(skinNum)} />
                </div>
              ) : (
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${tierColor}10, rgba(10,14,26,0.5))` }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className="absolute bottom-0.5 left-1.5 text-[7px] text-[#a09b8c] font-medium truncate max-w-[90px]">
                {getSkinLabel(championName, skinNum)}
              </span>
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{ border: `2px solid ${tierColor}`, boxShadow: `inset 0 0 12px ${tierColor}20` }}
                  layoutId="modal-active-skin"
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
