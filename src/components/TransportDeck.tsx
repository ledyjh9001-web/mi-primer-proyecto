import React from 'react';
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Sliders,
  Volume2,
} from 'lucide-react';
import { Track } from '../types/audio';
import { CoverArt } from './CoverArt';

interface TransportDeckProps {
  track: Track;
  isPlaying: boolean;
  progress: number; // 0..1
  volume: number; // 0..1
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onScrub: (ratio: number) => void;
  onVolumeChange: (vol: number) => void;
  onOpenDeck: () => void;
}

const formatTime = (sec: number): string => {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
};

export const TransportDeck: React.FC<TransportDeckProps> = ({
  track,
  isPlaying,
  progress,
  volume,
  onTogglePlay,
  onPrev,
  onNext,
  onScrub,
  onVolumeChange,
  onOpenDeck,
}) => {
  const elapsedSec = Math.floor(track.durationSec * progress);

  return (
    <footer
      aria-label="Hardware Transport Deck"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0c0d10] border-t border-[#dc2626] hard-shadow"
    >
      <div className="max-w-[1440px] mx-auto px-3 md:px-6 h-[64px] md:h-[72px] flex items-center justify-between gap-3 md:gap-6">
        {/* Track Identity */}
        <div className="flex items-center gap-3 min-w-0 w-[180px] sm:w-[240px] md:w-[280px] shrink-0">
          <button
            type="button"
            onClick={onOpenDeck}
            aria-label={`Inspect ${track.title} in Stem Deck`}
            className="w-10 h-10 md:w-12 md:h-12 border border-[#27272a] hover:border-[#dc2626] shrink-0 overflow-hidden cursor-pointer"
          >
            <CoverArt
              variant={track.coverVariant}
              code={track.releaseCode}
              title={track.title}
              accent={track.accentColor}
            />
          </button>
          <div className="min-w-0">
            <div className="font-anton text-[15px] md:text-[18px] leading-tight tracking-[0.03em] text-[#f4f4f5] truncate">
              {track.title}
            </div>
            <div className="text-[10px] md:text-[11px] font-mono-tech text-[#a1a1aa] truncate">
              <span className="text-[#f59e0b] font-bold">{track.bpm} BPM</span>
              <span className="mx-1.5 text-[#52525b]">/</span>
              <span>{track.musicalKey}</span>
            </div>
          </div>
        </div>

        {/* Transport Controls + Linear Waveform Scrub */}
        <div className="flex items-center gap-3 md:gap-5 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous track"
              className="w-8 h-9 md:w-9 md:h-10 border border-[#27272a] bg-[#121316] hover:border-[#dc2626] hover:bg-[#1a1212] flex items-center justify-center text-[#f4f4f5] cursor-pointer transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Pause playback' : 'Start playback'}
              className="w-10 h-9 md:w-12 md:h-10 bg-[#dc2626] hover:bg-[#ef4444] active:bg-[#ffffff] active:text-[#050506] flex items-center justify-center text-[#f4f4f5] cursor-pointer transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Next track"
              className="w-8 h-9 md:w-9 md:h-10 border border-[#27272a] bg-[#121316] hover:border-[#dc2626] hover:bg-[#1a1212] flex items-center justify-center text-[#f4f4f5] cursor-pointer transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Linear Waveform Scrub Bar (hidden on very small mobile to respect 15% cap and keep clean) */}
          <div className="hidden sm:flex items-center gap-3 flex-1 min-w-0">
            <span className="text-[11px] font-mono-tech text-[#f4f4f5] tabular-nums w-10 text-right shrink-0">
              {formatTime(elapsedSec)}
            </span>

            <div
              role="slider"
              tabIndex={0}
              aria-label="Track playback position"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.max(
                  0,
                  Math.min(1, (e.clientX - rect.left) / rect.width)
                );
                onScrub(ratio);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') onScrub(Math.min(1, progress + 0.05));
                if (e.key === 'ArrowLeft') onScrub(Math.max(0, progress - 0.05));
              }}
              className="flex-1 h-9 bg-[#050506] border border-[#27272a] hover:border-[#52525b] px-1.5 flex items-end gap-[2px] cursor-pointer relative overflow-hidden"
            >
              {track.waveform.map((heightVal, idx) => {
                const barRatio = idx / track.waveform.length;
                const isPlayed = barRatio <= progress;
                return (
                  <span
                    key={idx}
                    style={{ height: `${Math.round(heightVal * 100)}%` }}
                    className={`flex-1 block transition-colors duration-75 ${
                      isPlayed ? 'bg-[#dc2626]' : 'bg-[#27272a]'
                    }`}
                  />
                );
              })}
            </div>

            <span className="text-[11px] font-mono-tech text-[#71717a] tabular-nums w-10 shrink-0">
              {track.durationLabel}
            </span>
          </div>
        </div>

        {/* Right: Volume + Open Stem Deck */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 border border-[#27272a] bg-[#121316] px-2.5 h-10">
            <Volume2 className="w-3.5 h-3.5 text-[#a1a1aa]" />
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
              aria-label="Master volume"
              className="brutal-slider w-20"
            />
          </div>

          <button
            type="button"
            onClick={onOpenDeck}
            className="h-9 md:h-10 px-3 border border-[#27272a] bg-[#121316] hover:border-[#dc2626] hover:bg-[#1a1212] text-[11px] font-bold tracking-[0.08em] uppercase text-[#f4f4f5] flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-[#dc2626]" />
            <span className="hidden md:inline">MIX DECK</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
