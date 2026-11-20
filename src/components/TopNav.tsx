import React from 'react';
import { AppView } from '../types/audio';

interface TopNavProps {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
  crateCount: number;
  onPrimaryAction: () => void;
}

const NAV_ITEMS: { id: AppView; label: string }[] = [
  { id: 'catalog', label: 'CATALOG' },
  { id: 'deck', label: 'DECK' },
  { id: 'crate', label: 'CRATE' },
  { id: 'releases', label: 'RELEASES' },
];

export const TopNav: React.FC<TopNavProps> = ({
  activeView,
  onChangeView,
  crateCount,
  onPrimaryAction,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#050506] border-b border-[#27272a]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onChangeView('catalog')}
          className="font-anton text-[22px] md:text-[26px] tracking-[0.04em] text-[#f4f4f5] hover:text-[#ef4444] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#dc2626]"
        >
          CONCRETE HEAT
        </button>

        {/* Zone 2: 4 single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-3 md:gap-7 overflow-x-auto"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeView(item.id)}
                className={`h-14 px-1 text-[11px] md:text-[12px] font-bold tracking-[0.08em] uppercase whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#dc2626] ${
                  isActive
                    ? 'text-[#f4f4f5] border-[#dc2626]'
                    : 'text-[#a1a1aa] border-transparent hover:text-[#f4f4f5]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary CTA button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onPrimaryAction}
            className="chamfer-tr bg-[#dc2626] hover:bg-[#ef4444] active:bg-[#ffffff] active:text-[#050506] text-[#f4f4f5] px-3.5 md:px-5 py-2 text-[11px] font-bold tracking-[0.08em] uppercase whitespace-nowrap shrink-0 transition-colors duration-100 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#f4f4f5]"
          >
            {activeView === 'crate'
              ? 'OPEN DECK'
              : `CRATE [${String(crateCount).padStart(2, '0')}]`}
          </button>
        </div>
      </div>
    </header>
  );
};
