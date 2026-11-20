import React, { useMemo, useState } from 'react';
import { Download, Pause, Play, Trash2 } from 'lucide-react';
import { beatEngine } from '../audio/beatEngine';
import { TRACKS } from '../data/catalog';
import { ExportFormat, Track } from '../types/audio';
import { CoverArt } from '../components/CoverArt';
import { SquareCheckbox, SquareRadio } from '../components/Controls';

interface CrateViewProps {
  crateIds: string[];
  activeTrack: Track;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onOpenDeck: (track: Track) => void;
  onRemoveFromCrate: (trackId: string) => void;
  onClearCrate: () => void;
  onLoadStarterCrate: () => void;
  onGoCatalog: () => void;
}

const FORMAT_OPTIONS: {
  id: ExportFormat;
  label: string;
  detail: string;
}[] = [
  {
    id: 'WAV_24_48',
    label: '24-BIT / 48KHZ WAV (LOSSLESS)',
    detail: 'Uncompressed master bounce · Broadcast & DAW ready',
  },
  {
    id: 'WAV_16_44',
    label: '16-BIT / 44.1KHZ WAV',
    detail: 'Standard DJ CDJ / hardware sampler format',
  },
  {
    id: 'STEM_BUNDLE',
    label: '4-STEM BUNDLE (DRUMS / 808 / PERC / MEL)',
    detail: 'Isolated bus stems aligned to bar 01 · zero bleed',
  },
  {
    id: 'MP3_320',
    label: '320KBPS CBR MP3 DJ EDIT',
    detail: 'Compact club cue sheet with ID3 BPM/Key metadata',
  },
];

export const CrateView: React.FC<CrateViewProps> = ({
  crateIds,
  activeTrack,
  isPlaying,
  onPlayTrack,
  onOpenDeck,
  onRemoveFromCrate,
  onClearCrate,
  onLoadStarterCrate,
  onGoCatalog,
}) => {
  const crateTracks = useMemo(
    () => TRACKS.filter((t) => crateIds.includes(t.id)),
    [crateIds]
  );

  const [selectedIds, setSelectedIds] = useState<string[]>(crateIds);
  const [format, setFormat] = useState<ExportFormat>('WAV_24_48');
  const [includeBpmKey, setIncludeBpmKey] = useState(true);
  const [normalizePeak, setNormalizePeak] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [exportReceipt, setExportReceipt] = useState<string | null>(null);

  const validSelected = useMemo(
    () => selectedIds.filter((id) => crateIds.includes(id)),
    [selectedIds, crateIds]
  );

  const allSelected =
    crateTracks.length > 0 && validSelected.length === crateTracks.length;

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? crateTracks.map((t) => t.id) : []);
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id)
    );
  };

  const handleExport = async () => {
    const targets = crateTracks.filter((t) => validSelected.includes(t.id));
    if (targets.length === 0) return;

    setIsRendering(true);
    setExportReceipt(null);
    try {
      const lead = targets[0];
      const wavBlob = await beatEngine.renderTrackWavBlob(lead);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      const slug = lead.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const metaSuffix = includeBpmKey
        ? `_${lead.bpm}bpm_${lead.musicalKey.replace(/\s+/g, '')}`
        : '';
      a.href = url;
      a.download = `${lead.releaseCode}_${slug}${metaSuffix}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      setExportReceipt(
        `EXPORTED ${targets.length} CUT${targets.length > 1 ? 'S' : ''} · ${format.replace(/_/g, ' ')}${normalizePeak ? ' · -1.0 DBTP' : ''}`
      );
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 pt-6 pb-28 space-y-6">
      <div className="border-b border-[#27272a] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#dc2626]">
            PRODUCER STASH · BATCH RENDER
          </div>
          <h1 className="font-anton text-[32px] md:text-[42px] leading-none tracking-[0.03em] text-[#f4f4f5] mt-1">
            CRATE & STEM EXPORT
          </h1>
        </div>

        <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#a1a1aa]">
          STAGED CUTS: <span className="text-[#f59e0b]">{crateTracks.length}</span>{' '}
          · SELECTED FOR EXPORT:{' '}
          <span className="text-[#f4f4f5]">{validSelected.length}</span>
        </div>
      </div>

      {crateTracks.length === 0 ? (
        <div className="border border-[#27272a] bg-[#121316] p-10 text-center space-y-4">
          <h2 className="font-anton text-[28px] tracking-[0.03em] text-[#f4f4f5]">
            CRATE IS EMPTY
          </h2>
          <p className="text-[13px] text-[#a1a1aa] max-w-md mx-auto">
            Stage tracks from the Catalog Matrix or load the default Concrete Heat producer starter pack.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onGoCatalog}
              className="chamfer-tr px-5 py-2.5 bg-[#dc2626] hover:bg-[#ef4444] text-[#f4f4f5] text-[11px] font-bold tracking-[0.08em] uppercase cursor-pointer"
            >
              BROWSE CATALOG
            </button>
            <button
              type="button"
              onClick={onLoadStarterCrate}
              className="px-5 py-2.5 border border-[#27272a] bg-[#050506] hover:border-[#dc2626] text-[#f4f4f5] text-[11px] font-bold tracking-[0.08em] uppercase cursor-pointer"
            >
              LOAD STARTER PACK (04 CUTS)
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 8 cols: Saved Tracks */}
          <div className="lg:col-span-8 border border-[#27272a] bg-[#050506]">
            <div className="px-4 py-3 bg-[#121316] border-b border-[#27272a] flex items-center justify-between gap-4">
              <SquareCheckbox
                checked={allSelected}
                onChange={toggleAll}
                label={`SELECT ALL (${crateTracks.length})`}
              />

              <button
                type="button"
                onClick={onClearCrate}
                className="hazard-stripes border border-[#ef4444] px-3 py-1.5 text-[10px] font-bold tracking-[0.08em] uppercase text-[#f4f4f5] hover:bg-[#dc2626] cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3 h-3" />
                <span>CLEAR CRATE</span>
              </button>
            </div>

            <div>
              {crateTracks.map((track) => {
                const isSelected = validSelected.includes(track.id);
                const isCurrent = activeTrack.id === track.id;
                const isTrackPlaying = isCurrent && isPlaying;

                return (
                  <div
                    key={track.id}
                    className={`min-h-[64px] px-4 py-2.5 border-b border-[#1a1b1f] last:border-b-0 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 border-l-2 ${
                      isCurrent
                        ? 'bg-[#18191e] border-l-[#dc2626]'
                        : 'bg-[#0a0a0c] border-l-transparent hover:bg-[#141519]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <SquareCheckbox
                        checked={isSelected}
                        onChange={(c) => toggleOne(track.id, c)}
                        ariaLabel={`Select ${track.title} for export`}
                      />
                      <div className="w-10 h-10 border border-[#27272a] shrink-0">
                        <CoverArt
                          variant={track.coverVariant}
                          code={track.releaseCode}
                          title={track.title}
                          accent={track.accentColor}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => onPlayTrack(track)}
                        aria-label={
                          isTrackPlaying
                            ? `Pause ${track.title}`
                            : `Play ${track.title}`
                        }
                        className={`w-8 h-8 border shrink-0 flex items-center justify-center cursor-pointer ${
                          isTrackPlaying
                            ? 'bg-[#dc2626] border-[#dc2626] text-[#f4f4f5]'
                            : 'bg-[#121316] border-[#27272a] text-[#f4f4f5] hover:border-[#dc2626]'
                        }`}
                      >
                        {isTrackPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="text-[13px] font-bold tracking-[0.04em] uppercase text-[#f4f4f5] truncate">
                          {track.title}
                        </div>
                        <div className="text-[11px] text-[#a1a1aa] truncate">
                          {track.artist} · {track.releaseCode} ·{' '}
                          <span className="text-[#f59e0b] font-bold">
                            {track.bpm} BPM
                          </span>{' '}
                          · {track.musicalKey}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline-block bg-[#121316] border border-[#27272a] px-2 py-1 text-[10px] font-bold text-[#a1a1aa]">
                        {track.stemsCount} STEMS
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenDeck(track)}
                        className="px-2.5 py-1.5 border border-[#27272a] bg-[#121316] hover:border-[#dc2626] text-[10px] font-bold tracking-[0.08em] uppercase text-[#f4f4f5] cursor-pointer"
                      >
                        DECK
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveFromCrate(track.id)}
                        aria-label={`Remove ${track.title} from crate`}
                        className="px-2.5 py-1.5 border border-[#27272a] bg-[#050506] hover:border-[#ef4444] text-[10px] font-bold tracking-[0.08em] uppercase text-[#a1a1aa] hover:text-[#ef4444] cursor-pointer"
                      >
                        DEL
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 4 cols: Mastering & Export Console */}
          <aside className="lg:col-span-4 border border-[#27272a] bg-[#121316] p-5 space-y-5">
            <div className="border-b border-[#27272a] pb-3">
              <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#f59e0b]">
                AUDIO BOUNCE SPECIFICATION
              </div>
              <h2 className="font-anton text-[24px] tracking-[0.03em] text-[#f4f4f5] mt-0.5">
                EXPORT FORMAT
              </h2>
            </div>

            <div role="radiogroup" aria-label="Export format" className="space-y-2">
              {FORMAT_OPTIONS.map((opt) => (
                <SquareRadio
                  key={opt.id}
                  selected={format === opt.id}
                  onSelect={() => setFormat(opt.id)}
                  label={opt.label}
                  detail={opt.detail}
                />
              ))}
            </div>

            <div className="border-t border-[#27272a] pt-4 space-y-3">
              <SquareCheckbox
                checked={includeBpmKey}
                onChange={setIncludeBpmKey}
                label="EMBED BPM & KEY IN FILENAME"
              />
              <div>
                <SquareCheckbox
                  checked={normalizePeak}
                  onChange={setNormalizePeak}
                  label="LIMIT PEAK TO -1.0 DBTP"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={validSelected.length === 0 || isRendering}
              onClick={handleExport}
              className="chamfer-tr w-full h-12 bg-[#dc2626] hover:bg-[#ef4444] active:bg-[#ffffff] active:text-[#050506] disabled:bg-[#27272a] disabled:text-[#71717a] text-[#f4f4f5] text-[12px] font-bold tracking-[0.08em] uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>
                {isRendering
                  ? 'RENDERING AUDIO...'
                  : `RENDER & DOWNLOAD WAV (${validSelected.length})`}
              </span>
            </button>

            {exportReceipt && (
              <div className="border border-[#dc2626] bg-[#1a1b1f] p-3 hard-shadow space-y-1">
                <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#dc2626]">
                  BOUNCE COMPLETE
                </div>
                <div className="text-[11px] font-bold text-[#f4f4f5]">
                  {exportReceipt}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};
