import React from 'react';
import { Pause, Play, Plus } from 'lucide-react';
import { RELEASES, TRACKS } from '../data/catalog';
import { Track } from '../types/audio';
import { CoverArt } from '../components/CoverArt';
import { SquareCheckbox } from '../components/Controls';

interface ReleasesViewProps {
  selectedCode: string;
  activeTrack: Track;
  isPlaying: boolean;
  crateIds: string[];
  onSelectCode: (code: string) => void;
  onPlayTrack: (track: Track) => void;
  onOpenDeck: (track: Track) => void;
  onToggleCrate: (trackId: string) => void;
  onAddPackToCrate: (trackIds: string[]) => void;
}

export const ReleasesView: React.FC<ReleasesViewProps> = ({
  selectedCode,
  activeTrack,
  isPlaying,
  crateIds,
  onSelectCode,
  onPlayTrack,
  onOpenDeck,
  onToggleCrate,
  onAddPackToCrate,
}) => {
  const activeRelease =
    RELEASES.find((r) => r.code === selectedCode) ?? RELEASES[0];

  const packTracks = TRACKS.filter((t) =>
    activeRelease.trackIds.includes(t.id)
  );

  const allInCrate = packTracks.every((t) => crateIds.includes(t.id));

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 pt-6 pb-28 space-y-6">
      <div className="border-b border-[#27272a] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#f59e0b]">
            CATALOG ARCHIVE · 2025–2026
          </div>
          <h1 className="font-anton text-[32px] md:text-[42px] leading-none tracking-[0.03em] text-[#f4f4f5] mt-1">
            LABEL RELEASES
          </h1>
        </div>
        <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#a1a1aa]">
          06 ACTIVE PACKS · 12 MASTERED CUTS
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 cols: Release Index */}
        <div className="lg:col-span-5 border border-[#27272a] bg-[#050506]">
          {RELEASES.map((pack) => {
            const isSelected = pack.code === activeRelease.code;
            return (
              <button
                key={pack.code}
                type="button"
                onClick={() => onSelectCode(pack.code)}
                className={`w-full text-left p-4 border-b border-[#1a1b1f] last:border-b-0 flex items-center gap-4 border-l-2 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#18191e] border-l-[#dc2626]'
                    : 'bg-[#0a0a0c] border-l-transparent hover:bg-[#141519]'
                }`}
              >
                <div className="w-16 h-16 border border-[#27272a] shrink-0">
                  <CoverArt
                    variant={pack.coverVariant}
                    code={pack.code}
                    title={pack.title}
                    accent={pack.accentColor}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.08em] uppercase">
                    <span className="text-[#dc2626]">{pack.code}</span>
                    <span className="text-[#f59e0b]">{pack.bpmRange}</span>
                  </div>
                  <div className="font-anton text-[20px] leading-tight tracking-[0.03em] text-[#f4f4f5] truncate mt-0.5">
                    {pack.title}
                  </div>
                  <div className="text-[11px] text-[#a1a1aa] truncate">
                    {pack.producer} · {pack.genre}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right 7 cols: Release Inspector */}
        <div className="lg:col-span-7 border border-[#27272a] bg-[#121316]">
          <div className="p-6 border-b border-[#27272a] grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
            <div className="sm:col-span-5 border border-[#27272a] hard-shadow">
              <CoverArt
                variant={activeRelease.coverVariant}
                code={activeRelease.code}
                title={activeRelease.title}
                accent={activeRelease.accentColor}
              />
            </div>

            <div className="sm:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold tracking-[0.08em] uppercase">
                <span className="bg-[#dc2626] text-[#f4f4f5] px-2 py-0.5">
                  {activeRelease.code}
                </span>
                <span className="bg-[#27272a] text-[#f4f4f5] px-2 py-0.5">
                  {activeRelease.genre}
                </span>
                <span className="border border-[#27272a] bg-[#050506] text-[#f59e0b] px-2 py-0.5">
                  {activeRelease.bpmRange}
                </span>
              </div>

              <div>
                <h2 className="font-anton text-[32px] leading-none tracking-[0.02em] text-[#f4f4f5]">
                  {activeRelease.title}
                </h2>
                <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#a1a1aa] mt-1.5">
                  {activeRelease.producer} · {activeRelease.city} ·{' '}
                  {activeRelease.year}
                </div>
              </div>

              <p className="text-[13px] leading-[20px] text-[#d4d4d8]">
                {activeRelease.description}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onPlayTrack(packTracks[0])}
                  className="chamfer-tr h-10 px-5 bg-[#dc2626] hover:bg-[#ef4444] active:bg-[#ffffff] active:text-[#050506] text-[#f4f4f5] text-[11px] font-bold tracking-[0.08em] uppercase inline-flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>PLAY PACK</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddPackToCrate(activeRelease.trackIds)}
                  className="h-10 px-4 border border-[#27272a] bg-[#050506] hover:border-[#dc2626] text-[#f4f4f5] text-[11px] font-bold tracking-[0.08em] uppercase inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>
                    {allInCrate ? 'PACK STAGED IN CRATE' : 'STAGE ALL TO CRATE'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Release Tracks */}
          <div className="bg-[#050506]">
            <div className="px-4 py-2.5 bg-[#121316] border-b border-[#27272a] flex items-center justify-between text-[10px] font-bold tracking-[0.1em] uppercase text-[#71717a]">
              <span>INCLUDED MASTER CUTS</span>
              <span>{activeRelease.specs}</span>
            </div>

            {packTracks.map((track) => {
              const isCurrent = activeTrack.id === track.id;
              const isTrackPlaying = isCurrent && isPlaying;
              const inCrate = crateIds.includes(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track)}
                  className={`min-h-[56px] px-4 py-2 border-b border-[#1a1b1f] last:border-b-0 flex items-center justify-between gap-4 border-l-2 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#18191e] border-l-[#dc2626]'
                      : 'bg-[#0a0a0c] border-l-transparent hover:bg-[#18191e] hover:border-l-[#dc2626]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[11px] text-[#71717a] w-5">
                      {track.index}
                    </span>
                    <span
                      className={`w-7 h-7 border flex items-center justify-center shrink-0 ${
                        isTrackPlaying
                          ? 'bg-[#dc2626] border-[#dc2626] text-[#f4f4f5]'
                          : 'bg-[#121316] border-[#27272a] text-[#f4f4f5]'
                      }`}
                    >
                      {isTrackPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[13px] font-bold uppercase text-[#f4f4f5] truncate">
                        {track.title}
                      </div>
                      <div className="text-[11px] text-[#a1a1aa]">
                        {track.musicalKey} ·{' '}
                        <span className="text-[#f59e0b] font-bold">
                          {track.bpm} BPM
                        </span>{' '}
                        · {track.durationLabel}
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SquareCheckbox
                      checked={inCrate}
                      onChange={() => onToggleCrate(track.id)}
                      ariaLabel={`Save ${track.title} to crate`}
                    />
                    <button
                      type="button"
                      onClick={() => onOpenDeck(track)}
                      className="px-2.5 py-1 border border-[#27272a] bg-[#121316] hover:border-[#dc2626] text-[10px] font-bold tracking-[0.08em] uppercase text-[#f4f4f5] cursor-pointer"
                    >
                      OPEN DECK
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
