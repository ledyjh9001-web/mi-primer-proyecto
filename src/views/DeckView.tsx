import React, { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { beatEngine } from '../audio/beatEngine';
import { TRACKS } from '../data/catalog';
import {
  StemChannelKey,
  StemMixerState,
  StemPattern,
  Track,
} from '../types/audio';
import { CoverArt } from '../components/CoverArt';
import { SquareCheckbox } from '../components/Controls';

interface DeckViewProps {
  track: Track;
  isPlaying: boolean;
  currentStep: number;
  bpmOverride: number;
  filterCutoff: number;
  mixer: StemMixerState;
  pattern: StemPattern;
  inCrate: boolean;
  onSelectTrack: (track: Track) => void;
  onTogglePlay: () => void;
  onBpmChange: (bpm: number) => void;
  onFilterChange: (freq: number) => void;
  onMixerChange: (next: StemMixerState) => void;
  onToggleStep: (channel: StemChannelKey, stepIdx: number) => void;
  onResetPattern: () => void;
  onToggleCrate: () => void;
}

const CHANNELS: {
  key: StemChannelKey;
  label: string;
  spec: string;
  accent: string;
}[] = [
  {
    key: 'drums',
    label: '01 · DRUM BUS',
    spec: 'KICK / SNARE SNAP',
    accent: '#dc2626',
  },
  {
    key: 'sub808',
    label: '02 · 808 SUB',
    spec: 'LOW-END GLIDE',
    accent: '#f59e0b',
  },
  {
    key: 'perc',
    label: '03 · PERC / HAT',
    spec: 'DEMBOW RIM / HATS',
    accent: '#dc2626',
  },
  {
    key: 'melodic',
    label: '04 · MELODIC CHOP',
    spec: 'SYNTH STAB / BELL',
    accent: '#f59e0b',
  },
];

export const DeckView: React.FC<DeckViewProps> = ({
  track,
  isPlaying,
  currentStep,
  bpmOverride,
  filterCutoff,
  mixer,
  pattern,
  inCrate,
  onSelectTrack,
  onTogglePlay,
  onBpmChange,
  onFilterChange,
  onMixerChange,
  onToggleStep,
  onResetPattern,
  onToggleCrate,
}) => {
  const [spectrum, setSpectrum] = useState<number[]>(
    Array.from({ length: 24 }, () => 0.08)
  );

  useEffect(() => {
    let rafId = 0;
    const tick = () => {
      setSpectrum(beatEngine.getSpectrumBars(24));
      if (isPlaying) {
        rafId = window.requestAnimationFrame(tick);
      }
    };
    if (isPlaying) {
      rafId = window.requestAnimationFrame(tick);
    } else {
      setSpectrum(Array.from({ length: 24 }, () => 0.08));
    }
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [isPlaying]);

  const toggleMute = (key: StemChannelKey) => {
    onMixerChange({
      ...mixer,
      [key]: { ...mixer[key], muted: !mixer[key].muted },
    });
  };

  const toggleSolo = (key: StemChannelKey) => {
    onMixerChange({
      ...mixer,
      [key]: { ...mixer[key], solo: !mixer[key].solo },
    });
  };

  const setGain = (key: StemChannelKey, gain: number) => {
    onMixerChange({
      ...mixer,
      [key]: { ...mixer[key], gain },
    });
  };

  const anySolo = Object.values(mixer).some((ch) => ch.solo);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 pt-6 pb-28 space-y-6">
      {/* Track Switcher Header */}
      <div className="border border-[#27272a] bg-[#121316] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 border border-[#27272a] shrink-0">
            <CoverArt
              variant={track.coverVariant}
              code={track.releaseCode}
              title={track.title}
              accent={track.accentColor}
            />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#dc2626]">
              STEM CONSOLE · {track.releaseCode}
            </div>
            <h1 className="font-anton text-[28px] md:text-[36px] leading-none tracking-[0.03em] text-[#f4f4f5] truncate mt-1">
              {track.title}
            </h1>
            <div className="text-[11px] text-[#a1a1aa] mt-1">
              {track.artist} · {track.genre} · {track.musicalKey} ·{' '}
              <span className="text-[#f59e0b] font-bold">{bpmOverride} BPM</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-[10px] font-bold tracking-[0.08em] uppercase text-[#a1a1aa]">
            <span>LOAD CUT:</span>
            <select
              value={track.id}
              onChange={(e) => {
                const found = TRACKS.find((t) => t.id === e.target.value);
                if (found) onSelectTrack(found);
              }}
              aria-label="Load track into stem deck"
              className="h-10 bg-[#0a0a0c] border border-[#27272a] focus:border-[#dc2626] px-3 text-[11px] font-bold text-[#f4f4f5] uppercase focus:outline-none cursor-pointer"
            >
              {TRACKS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.index} · {t.title} ({t.bpm} BPM)
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={onTogglePlay}
            className="chamfer-tr h-10 px-5 bg-[#dc2626] hover:bg-[#ef4444] active:bg-[#ffffff] active:text-[#050506] text-[#f4f4f5] text-[11px] font-bold tracking-[0.08em] uppercase inline-flex items-center gap-2 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>STOP ENGINE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>RUN ENGINE</span>
              </>
            )}
          </button>

          <div className="h-10 px-3 border border-[#27272a] bg-[#050506] flex items-center">
            <SquareCheckbox
              checked={inCrate}
              onChange={onToggleCrate}
              label="IN CRATE"
            />
          </div>
        </div>
      </div>

      {/* Master Spectrum & Hardware Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Live Spectrum */}
        <div className="lg:col-span-7 border border-[#27272a] bg-[#0a0a0c] p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.1em] uppercase">
            <span className="text-[#a1a1aa]">
              MASTER SPECTRUM ANALYSER (20HZ – 18KHZ)
            </span>
            <span className="text-[#f59e0b]">
              LIMITER: {track.lufs} · STEP {String(currentStep + 1).padStart(2, '0')}/16
            </span>
          </div>

          <div className="h-28 bg-[#050506] border border-[#27272a] p-2 flex items-end gap-1">
            {spectrum.map((val, idx) => {
              const isHot = val > 0.78;
              return (
                <div
                  key={idx}
                  style={{ height: `${Math.round(val * 100)}%` }}
                  className={`flex-1 transition-all duration-75 ${
                    isHot ? 'bg-[#f59e0b]' : 'bg-[#dc2626]'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* BPM & Filter Rack */}
        <div className="lg:col-span-5 border border-[#27272a] bg-[#121316] p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-[#27272a] bg-[#050506] p-3 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-[#a1a1aa]">
                MASTER TEMPO
              </span>
              <span className="text-[15px] font-bold text-[#f59e0b] tabular-nums">
                {bpmOverride} BPM
              </span>
            </div>
            <input
              type="range"
              min={70}
              max={160}
              value={bpmOverride}
              onChange={(e) => onBpmChange(Number(e.target.value))}
              aria-label="Master tempo BPM"
              className="brutal-slider w-full"
            />
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onBpmChange(Math.max(70, bpmOverride - 2))}
                className="flex-1 py-1 border border-[#27272a] bg-[#121316] hover:border-[#dc2626] text-[10px] font-bold text-[#f4f4f5] cursor-pointer"
              >
                -2 BPM
              </button>
              <button
                type="button"
                onClick={() => onBpmChange(track.bpm)}
                className="flex-1 py-1 border border-[#27272a] bg-[#121316] hover:border-[#f59e0b] text-[10px] font-bold text-[#a1a1aa] cursor-pointer"
              >
                SYNC {track.bpm}
              </button>
              <button
                type="button"
                onClick={() => onBpmChange(Math.min(160, bpmOverride + 2))}
                className="flex-1 py-1 border border-[#27272a] bg-[#121316] hover:border-[#dc2626] text-[10px] font-bold text-[#f4f4f5] cursor-pointer"
              >
                +2 BPM
              </button>
            </div>
          </div>

          <div className="border border-[#27272a] bg-[#050506] p-3 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.08em] uppercase text-[#a1a1aa]">
                LPF CUTOFF
              </span>
              <span className="text-[14px] font-bold text-[#f4f4f5] tabular-nums">
                {filterCutoff >= 1000
                  ? `${(filterCutoff / 1000).toFixed(1)} KHZ`
                  : `${filterCutoff} HZ`}
              </span>
            </div>
            <input
              type="range"
              min={250}
              max={18000}
              step={50}
              value={filterCutoff}
              onChange={(e) => onFilterChange(Number(e.target.value))}
              aria-label="Master low-pass filter cutoff"
              className="brutal-slider w-full"
            />
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onFilterChange(650)}
                className="flex-1 py-1 border border-[#27272a] bg-[#121316] hover:border-[#dc2626] text-[10px] font-bold text-[#f4f4f5] cursor-pointer"
              >
                SUB ONLY
              </button>
              <button
                type="button"
                onClick={() => onFilterChange(16000)}
                className="flex-1 py-1 border border-[#27272a] bg-[#121316] hover:border-[#dc2626] text-[10px] font-bold text-[#f4f4f5] cursor-pointer"
              >
                FULL OPEN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Channel Stem Matrix & Interactive 16-Step Sequencer */}
      <section aria-label="4-Channel Stem Sequencer" className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
          <div>
            <h2 className="font-anton text-[22px] tracking-[0.03em] text-[#f4f4f5]">
              4-STEM SEQUENCER & CHANNEL STRIP
            </h2>
            <p className="text-[11px] text-[#a1a1aa]">
              Click any step cell (01–16) to toggle triggers live during playback.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetPattern}
            className="px-3 py-1.5 border border-[#27272a] bg-[#121316] hover:border-[#dc2626] text-[10px] font-bold tracking-[0.08em] uppercase text-[#f4f4f5] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESTORE PATTERN</span>
          </button>
        </div>

        <div className="space-y-3">
          {CHANNELS.map((ch) => {
            const state = mixer[ch.key];
            const isDimmed =
              state.muted || (anySolo && !state.solo);
            const steps = pattern[ch.key];

            return (
              <div
                key={ch.key}
                className={`border bg-[#121316] p-4 grid grid-cols-1 xl:grid-cols-12 gap-4 items-center transition-colors ${
                  state.solo
                    ? 'border-[#f59e0b]'
                    : 'border-[#27272a]'
                }`}
              >
                {/* Channel Info + M/S/Gain */}
                <div className="xl:col-span-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                  <div className="min-w-[140px]">
                    <div className="text-[12px] font-bold tracking-[0.06em] uppercase text-[#f4f4f5]">
                      {ch.label}
                    </div>
                    <div className="text-[10px] text-[#71717a] uppercase tracking-[0.06em]">
                      {ch.spec}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleMute(ch.key)}
                      aria-label={`Mute ${ch.label}`}
                      className={`w-9 h-8 border text-[11px] font-bold cursor-pointer ${
                        state.muted
                          ? 'bg-[#dc2626] border-[#dc2626] text-[#f4f4f5]'
                          : 'bg-[#050506] border-[#27272a] text-[#a1a1aa] hover:border-[#dc2626]'
                      }`}
                    >
                      M
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSolo(ch.key)}
                      aria-label={`Solo ${ch.label}`}
                      className={`w-9 h-8 border text-[11px] font-bold cursor-pointer ${
                        state.solo
                          ? 'bg-[#f59e0b] border-[#f59e0b] text-[#050506]'
                          : 'bg-[#050506] border-[#27272a] text-[#a1a1aa] hover:border-[#f59e0b]'
                      }`}
                    >
                      S
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(state.gain * 100)}
                      onChange={(e) =>
                        setGain(ch.key, Number(e.target.value) / 100)
                      }
                      aria-label={`${ch.label} gain`}
                      className="brutal-slider w-20"
                    />
                  </div>
                </div>

                {/* 16-Step Interactive Grid */}
                <div
                  className={`xl:col-span-8 grid grid-cols-8 sm:grid-cols-16 gap-1.5 ${
                    isDimmed ? 'opacity-45' : ''
                  }`}
                >
                  {steps.map((stepVal, idx) => {
                    const active = Boolean(stepVal);
                    const isPlayhead = isPlaying && currentStep === idx;
                    const isQuarterBeat = idx % 4 === 0;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onToggleStep(ch.key, idx)}
                        aria-label={`${ch.label} step ${idx + 1}`}
                        className={`h-11 border flex flex-col items-center justify-between py-1 cursor-pointer transition-colors duration-75 ${
                          isPlayhead
                            ? 'border-[#f4f4f5]'
                            : isQuarterBeat
                              ? 'border-[#3f3f46]'
                              : 'border-[#27272a]'
                        } ${
                          active
                            ? ch.accent === '#dc2626'
                              ? 'bg-[#dc2626] text-[#f4f4f5]'
                              : 'bg-[#f59e0b] text-[#050506]'
                            : 'bg-[#050506] text-[#52525b] hover:border-[#dc2626]'
                        }`}
                      >
                        <span className="text-[9px] font-bold leading-none">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span
                          className={`w-2 h-1 block ${
                            isPlayhead
                              ? 'bg-[#f4f4f5]'
                              : active
                                ? 'bg-current'
                                : 'bg-transparent'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
