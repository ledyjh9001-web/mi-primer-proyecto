import React, { useMemo, useState } from 'react';
import { ArrowUpRight, Pause, Play, Sliders } from 'lucide-react';
import { RELEASES, TRACKS } from '../data/catalog';
import { Genre, Track } from '../types/audio';
import { CoverArt } from '../components/CoverArt';
import { SquareCheckbox, TerminalInput } from '../components/Controls';

interface CatalogViewProps {
  activeTrack: Track;
  isPlaying: boolean;
  crateIds: string[];
  onPlayTrack: (track: Track) => void;
  onToggleCrate: (trackId: string) => void;
  onOpenDeck: (track: Track) => void;
  onSelectRelease: (releaseCode: string) => void;
}

type BpmFilter = 'ALL' | 'SLOW' | 'MID' | 'FAST';

const GENRES: ('ALL' | Genre)[] = [
  'ALL',
  'UNDERGROUND',
  'LATIN TRAP',
  'DEMBOW',
  'NEO-PERREO',
];

export const CatalogView: React.FC<CatalogViewProps> = ({
  activeTrack,
  isPlaying,
  crateIds,
  onPlayTrack,
  onToggleCrate,
  onOpenDeck,
  onSelectRelease,
}) => {
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState<'ALL' | Genre>('ALL');
  const [bpmFilter, setBpmFilter] = useState<BpmFilter>('ALL');
  const [onlyCrate, setOnlyCrate] = useState(false);

  const heroTrack = TRACKS[0];
  const isHeroPlaying = isPlaying && activeTrack.id === heroTrack.id;

  const filteredTracks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TRACKS.filter((t) => {
      if (genreFilter !== 'ALL' && t.genre !== genreFilter) return false;
      if (bpmFilter === 'SLOW' && t.bpm >= 105) return false;
      if (bpmFilter === 'MID' && (t.bpm < 105 || t.bpm > 125)) return false;
      if (bpmFilter === 'FAST' && t.bpm <= 125) return false;
      if (onlyCrate && !crateIds.includes(t.id)) return false;
      if (q) {
        const hay = `${t.title} ${t.artist} ${t.genre} ${t.musicalKey} ${t.bpm} ${t.releaseCode}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [search, genreFilter, bpmFilter, onlyCrate, crateIds]);

  const featuredReleases = RELEASES.slice(0, 4);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 pt-6 pb-28 space-y-10">
      {/* HERO DROP BANNER */}
      <section
        aria-label="Featured Release Drop"
        className="border border-[#27272a] bg-[#121316] grid grid-cols-1 lg:grid-cols-12 items-stretch"
      >
        <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between gap-6 border-b lg:border-b-0 lg:border-r border-[#27272a] grid-plate-bg">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold tracking-[0.08em] uppercase text-[#a1a1aa]">
              <span className="bg-[#dc2626] text-[#f4f4f5] px-2 py-0.5">
                FEATURED DROP
              </span>
              <span>{heroTrack.releaseCode}</span>
              <span aria-hidden="true">/</span>
              <span className="text-[#f59e0b]">{heroTrack.bpm} BPM</span>
              <span aria-hidden="true">/</span>
              <span>{heroTrack.musicalKey}</span>
              <span aria-hidden="true">/</span>
              <span>{heroTrack.sampleRate}</span>
            </div>

            <h1 className="font-anton text-[38px] md:text-[56px] leading-[40px] md:leading-[56px] tracking-[0.02em] text-[#f4f4f5] text-balance">
              FUEGO EN EL BLOQUE
            </h1>

            <p className="text-[13px] md:text-[15px] leading-[22px] text-[#a1a1aa] max-w-2xl">
              Raw analog sub-bass, clipped dembow snare transients, and isolated 4-channel stems built for heavy street systems and direct DAW slicing.
            </p>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 border border-[#27272a] bg-[#050506]">
              <div className="p-3 border-b sm:border-b-0 border-r border-[#27272a]">
                <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-[#71717a]">
                  PRODUCER
                </div>
                <div className="text-[12px] font-bold text-[#f4f4f5] mt-1">
                  {heroTrack.artist}
                </div>
              </div>
              <div className="p-3 border-b sm:border-b-0 sm:border-r border-[#27272a]">
                <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-[#71717a]">
                  TEMPO / KEY
                </div>
                <div className="text-[12px] font-bold text-[#f59e0b] mt-1">
                  {heroTrack.bpm} BPM · {heroTrack.musicalKey}
                </div>
              </div>
              <div className="p-3 border-r border-[#27272a]">
                <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-[#71717a]">
                  LOUDNESS
                </div>
                <div className="text-[12px] font-bold text-[#f4f4f5] mt-1">
                  {heroTrack.lufs}
                </div>
              </div>
              <div className="p-3">
                <div className="text-[9px] font-bold tracking-[0.1em] uppercase text-[#71717a]">
                  STEM PACK
                </div>
                <div className="text-[12px] font-bold text-[#f4f4f5] mt-1">
                  04 CHANNELS
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onPlayTrack(heroTrack)}
                className="chamfer-tr h-11 px-6 bg-[#dc2626] hover:bg-[#ef4444] active:bg-[#ffffff] active:text-[#050506] text-[#f4f4f5] text-[12px] font-bold tracking-[0.08em] uppercase inline-flex items-center gap-2.5 cursor-pointer transition-colors duration-100"
              >
                {isHeroPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>PAUSE DROP</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>PLAY DROP</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onOpenDeck(heroTrack)}
                className="h-11 px-5 border border-[#27272a] bg-[#050506] hover:border-[#dc2626] hover:bg-[#1a1212] text-[#f4f4f5] text-[12px] font-bold tracking-[0.08em] uppercase inline-flex items-center gap-2 cursor-pointer transition-colors duration-100"
              >
                <Sliders className="w-4 h-4 text-[#f59e0b]" />
                <span>OPEN IN STEM DECK</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Right Poster Art */}
        <div className="lg:col-span-5 bg-[#050506] flex flex-col justify-between">
          <div className="p-4 md:p-6 flex-1 flex items-center justify-center">
            <div className="w-full max-w-[360px] border border-[#27272a] hard-shadow">
              <CoverArt
                variant={heroTrack.coverVariant}
                code={heroTrack.releaseCode}
                title={heroTrack.title}
                accent="crimson"
              />
            </div>
          </div>
          <div className="border-t border-[#27272a] bg-[#121316] px-5 py-3 flex items-center justify-between text-[11px] font-bold tracking-[0.08em] uppercase">
            <span className="text-[#a1a1aa]">SAN JUAN / MEDELLIN</span>
            <span className="text-[#f59e0b]">MASTERED FOR SUBSYSTEM</span>
          </div>
        </div>
      </section>

      {/* FEATURED CRATE TILES */}
      <section aria-label="Release Crates" className="space-y-4">
        <div className="flex items-end justify-between border-b border-[#27272a] pb-3">
          <div>
            <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#dc2626]">
              01 · PACK ARCHIVE
            </div>
            <h2 className="font-anton text-[24px] md:text-[32px] leading-tight tracking-[0.03em] text-[#f4f4f5]">
              FEATURED CRATE DROPS
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onSelectRelease(RELEASES[0].code)}
            className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#a1a1aa] hover:text-[#f4f4f5] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <span>ALL RELEASES</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredReleases.map((pack) => {
            const leadTrack =
              TRACKS.find((t) => t.id === pack.trackIds[0]) ?? TRACKS[0];
            const isPackPlaying =
              isPlaying && pack.trackIds.includes(activeTrack.id);

            return (
              <article
                key={pack.code}
                className={`border bg-[#121316] flex flex-col transition-colors duration-100 ${
                  isPackPlaying
                    ? 'border-[#dc2626]'
                    : 'border-[#27272a] hover:border-[#52525b]'
                }`}
              >
                <div className="relative border-b border-[#27272a] group">
                  <CoverArt
                    variant={pack.coverVariant}
                    code={pack.code}
                    title={pack.title}
                    accent={pack.accentColor}
                  />
                  <button
                    type="button"
                    onClick={() => onPlayTrack(leadTrack)}
                    aria-label={
                      isPackPlaying
                        ? `Pause ${pack.title}`
                        : `Play ${pack.title}`
                    }
                    className="absolute bottom-3 right-3 w-11 h-11 bg-[#dc2626] hover:bg-[#ef4444] active:bg-[#ffffff] active:text-[#050506] text-[#f4f4f5] flex items-center justify-center hard-shadow cursor-pointer transition-colors"
                  >
                    {isPackPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.08em] uppercase text-[#a1a1aa] mb-1">
                      <span>{pack.genre}</span>
                      <span className="text-[#f59e0b]">{pack.bpmRange}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectRelease(pack.code)}
                      className="text-left font-anton text-[20px] leading-[22px] tracking-[0.04em] text-[#f4f4f5] hover:text-[#ef4444] transition-colors cursor-pointer"
                    >
                      {pack.title}
                    </button>
                    <div className="text-[11px] text-[#a1a1aa] mt-1">
                      {pack.producer}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#27272a] flex items-center justify-between text-[10px] font-bold tracking-[0.08em] uppercase text-[#71717a]">
                    <span>{pack.specs}</span>
                    <button
                      type="button"
                      onClick={() => onSelectRelease(pack.code)}
                      className="text-[#f4f4f5] hover:text-[#dc2626] cursor-pointer"
                    >
                      INSPECT →
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* FILTER BAR & MASTER TRACKLIST MATRIX */}
      <section aria-label="Master Tracklist" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#27272a] pb-3">
          <div>
            <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#f59e0b]">
              02 · STREET CUTS INDEX
            </div>
            <h2 className="font-anton text-[24px] md:text-[32px] leading-tight tracking-[0.03em] text-[#f4f4f5]">
              MASTER TRACKLIST MATRIX
            </h2>
          </div>

          <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#a1a1aa]">
            SHOWING {String(filteredTracks.length).padStart(2, '0')} OF{' '}
            {String(TRACKS.length).padStart(2, '0')} CUTS
          </div>
        </div>

        {/* Search + Filter Controls */}
        <div className="bg-[#121316] border border-[#27272a] p-4 space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            <div className="lg:col-span-5">
              <TerminalInput
                value={search}
                onChange={setSearch}
                placeholder="SEARCH TITLE, ARTIST, KEY, BPM, CODE..."
              />
            </div>

            <div className="lg:col-span-7 flex flex-wrap items-center gap-2">
              {GENRES.map((genre) => {
                const active = genreFilter === genre;
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => setGenreFilter(genre)}
                    className={`h-9 px-3 text-[11px] font-bold tracking-[0.08em] uppercase whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                      active
                        ? 'bg-[#dc2626] text-[#f4f4f5] chamfer-tr'
                        : 'bg-[#27272a] text-[#e5e1e4] hover:bg-[#353437]'
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#27272a] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-[#71717a] mr-1">
                TEMPO BAND:
              </span>
              {(
                [
                  { id: 'ALL', label: 'ALL BPM' },
                  { id: 'SLOW', label: '< 105' },
                  { id: 'MID', label: '105–125' },
                  { id: 'FAST', label: '125+' },
                ] as const
              ).map((band) => {
                const active = bpmFilter === band.id;
                return (
                  <button
                    key={band.id}
                    type="button"
                    onClick={() => setBpmFilter(band.id)}
                    className={`px-2.5 py-1 border text-[10px] font-bold tracking-[0.08em] uppercase cursor-pointer transition-colors ${
                      active
                        ? 'border-[#f59e0b] bg-[#1a150a] text-[#f59e0b]'
                        : 'border-[#27272a] bg-[#050506] text-[#a1a1aa] hover:text-[#f4f4f5]'
                    }`}
                  >
                    {band.label}
                  </button>
                );
              })}
            </div>

            <SquareCheckbox
              checked={onlyCrate}
              onChange={setOnlyCrate}
              label="SAVED IN CRATE ONLY"
            />
          </div>
        </div>

        {/* Tracklist Table */}
        <div className="border border-[#27272a] bg-[#050506]">
          {/* Column Header */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2.5 bg-[#121316] border-b border-[#27272a] text-[10px] font-bold tracking-[0.1em] uppercase text-[#71717a]">
            <div className="col-span-1">IDX</div>
            <div className="col-span-4">CUT / PRODUCER</div>
            <div className="col-span-2">GENRE</div>
            <div className="col-span-1">KEY</div>
            <div className="col-span-1 text-right">BPM</div>
            <div className="col-span-1 text-right">TIME</div>
            <div className="col-span-2 text-right">CRATE / DECK</div>
          </div>

          {filteredTracks.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <div className="font-anton text-[22px] tracking-[0.04em] text-[#f4f4f5]">
                NO CUTS MATCH CURRENT FILTERS
              </div>
              <p className="text-[12px] text-[#a1a1aa]">
                Reset search query, genre tag, or tempo filter to restore full catalog.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setGenreFilter('ALL');
                  setBpmFilter('ALL');
                  setOnlyCrate(false);
                }}
                className="px-4 py-2 bg-[#dc2626] text-[#f4f4f5] text-[11px] font-bold tracking-[0.08em] uppercase cursor-pointer"
              >
                RESET FILTERS
              </button>
            </div>
          ) : (
            <div>
              {filteredTracks.map((track) => {
                const isActive = activeTrack.id === track.id;
                const isTrackPlaying = isActive && isPlaying;
                const inCrate = crateIds.includes(track.id);

                return (
                  <div
                    key={track.id}
                    onClick={() => onPlayTrack(track)}
                    className={`min-h-[56px] px-4 py-2 border-b border-[#1a1b1f] last:border-b-0 grid grid-cols-12 gap-3 items-center cursor-pointer transition-colors duration-75 border-l-2 ${
                      isActive
                        ? 'bg-[#18191e] border-l-[#dc2626]'
                        : 'bg-[#0a0a0c] border-l-transparent hover:bg-[#18191e] hover:border-l-[#dc2626]'
                    }`}
                  >
                    {/* Index + Play Icon */}
                    <div className="col-span-2 md:col-span-1 flex items-center gap-2">
                      <span className="text-[11px] font-mono-tech text-[#71717a] w-5">
                        {track.index}
                      </span>
                      <span
                        className={`w-7 h-7 flex items-center justify-center border ${
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
                    </div>

                    {/* Title + Artist */}
                    <div className="col-span-7 md:col-span-4 min-w-0">
                      <div className="text-[13px] font-bold tracking-[0.04em] uppercase text-[#f4f4f5] truncate">
                        {track.title}
                      </div>
                      <div className="text-[11px] text-[#a1a1aa] truncate">
                        {track.artist} · {track.releaseCode}
                      </div>
                    </div>

                    {/* Genre */}
                    <div className="hidden md:flex col-span-2 items-center">
                      <span className="bg-[#27272a] text-[#f4f4f5] px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] uppercase whitespace-nowrap">
                        {track.genre}
                      </span>
                    </div>

                    {/* Musical Key */}
                    <div className="hidden md:block col-span-1 text-[11px] font-bold text-[#e5e1e4]">
                      {track.musicalKey}
                    </div>

                    {/* BPM Chip */}
                    <div className="hidden md:flex col-span-1 justify-end">
                      <span className="bg-[#121316] border border-[#27272a] px-2 py-0.5 text-[11px] font-bold text-[#f59e0b] tabular-nums">
                        {track.bpm}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="hidden md:block col-span-1 text-right text-[11px] text-[#a1a1aa] tabular-nums">
                      {track.durationLabel}
                    </div>

                    {/* Crate Checkbox & Open Deck */}
                    <div
                      className="col-span-3 md:col-span-2 flex items-center justify-end gap-2.5"
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
                        className="px-2.5 py-1 border border-[#27272a] bg-[#121316] hover:border-[#dc2626] hover:bg-[#1a1212] text-[10px] font-bold tracking-[0.08em] uppercase text-[#f4f4f5] cursor-pointer whitespace-nowrap"
                      >
                        DECK
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
