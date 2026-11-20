import { useCallback, useEffect, useState } from 'react';
import { beatEngine } from './audio/beatEngine';
import { TransportDeck } from './components/TransportDeck';
import { TopNav } from './components/TopNav';
import { RELEASES, TRACKS } from './data/catalog';
import {
  AppView,
  StemChannelKey,
  StemMixerState,
  StemPattern,
  Track,
} from './types/audio';
import { CatalogView } from './views/CatalogView';
import { CrateView } from './views/CrateView';
import { DeckView } from './views/DeckView';
import { ReleasesView } from './views/ReleasesView';

const DEFAULT_MIXER: StemMixerState = {
  drums: { muted: false, solo: false, gain: 0.9 },
  sub808: { muted: false, solo: false, gain: 0.92 },
  perc: { muted: false, solo: false, gain: 0.78 },
  melodic: { muted: false, solo: false, gain: 0.72 },
};

const STARTER_CRATE = ['ch-042-01', 'ch-039-01', 'ch-035-01', 'ch-031-01'];

function clonePattern(pattern: StemPattern): StemPattern {
  return {
    drums: [...pattern.drums],
    perc: [...pattern.perc],
    sub808: [...pattern.sub808],
    melodic: [...pattern.melodic],
  };
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('catalog');
  const [activeTrack, setActiveTrack] = useState<Track>(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [bpmOverride, setBpmOverride] = useState(TRACKS[0].bpm);
  const [filterCutoff, setFilterCutoff] = useState(16000);
  const [mixer, setMixer] = useState<StemMixerState>(DEFAULT_MIXER);
  const [pattern, setPattern] = useState<StemPattern>(() =>
    clonePattern(TRACKS[0].pattern)
  );
  const [selectedReleaseCode, setSelectedReleaseCode] = useState(
    RELEASES[0].code
  );
  const [crateIds, setCrateIds] = useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem('concrete_heat_crate');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return STARTER_CRATE;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(
        'concrete_heat_crate',
        JSON.stringify(crateIds)
      );
    } catch {
      // ignore storage errors
    }
  }, [crateIds]);

  useEffect(() => {
    beatEngine.onStep((step) => {
      setCurrentStep(step);
    });
    return () => {
      beatEngine.stop();
    };
  }, []);

  // Progress meter timer while playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = window.setInterval(() => {
      setProgress((prev) => {
        const increment = 0.25 / Math.max(60, activeTrack.durationSec);
        const next = prev + increment;
        return next >= 1 ? 0 : next;
      });
    }, 250);
    return () => window.clearInterval(interval);
  }, [isPlaying, activeTrack.durationSec]);

  const loadTrackIntoEngine = useCallback(
    (track: Track, autoPlay: boolean) => {
      const freshPattern = clonePattern(track.pattern);
      setActiveTrack(track);
      setBpmOverride(track.bpm);
      setPattern(freshPattern);
      setProgress(0);
      setCurrentStep(0);
      beatEngine.setTrack(track);
      beatEngine.setStep(0);
      if (autoPlay) {
        beatEngine.start();
        setIsPlaying(true);
      }
    },
    []
  );

  const handlePlayTrack = useCallback(
    (track: Track) => {
      if (activeTrack.id === track.id) {
        if (isPlaying) {
          beatEngine.stop();
          setIsPlaying(false);
        } else {
          beatEngine.start();
          setIsPlaying(true);
        }
      } else {
        loadTrackIntoEngine(track, true);
      }
    },
    [activeTrack.id, isPlaying, loadTrackIntoEngine]
  );

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      beatEngine.stop();
      setIsPlaying(false);
    } else {
      beatEngine.setTrack(activeTrack);
      beatEngine.updatePattern(pattern);
      beatEngine.setBpm(bpmOverride);
      beatEngine.start();
      setIsPlaying(true);
    }
  }, [isPlaying, activeTrack, pattern, bpmOverride]);

  const handlePrev = useCallback(() => {
    const idx = TRACKS.findIndex((t) => t.id === activeTrack.id);
    const prevIdx = (idx - 1 + TRACKS.length) % TRACKS.length;
    loadTrackIntoEngine(TRACKS[prevIdx], isPlaying);
  }, [activeTrack.id, isPlaying, loadTrackIntoEngine]);

  const handleNext = useCallback(() => {
    const idx = TRACKS.findIndex((t) => t.id === activeTrack.id);
    const nextIdx = (idx + 1) % TRACKS.length;
    loadTrackIntoEngine(TRACKS[nextIdx], isPlaying);
  }, [activeTrack.id, isPlaying, loadTrackIntoEngine]);

  const handleScrub = useCallback((ratio: number) => {
    setProgress(ratio);
    const step = Math.floor(ratio * 16) % 16;
    beatEngine.setStep(step);
    setCurrentStep(step);
  }, []);

  const handleVolumeChange = useCallback((vol: number) => {
    setVolume(vol);
    beatEngine.setVolume(vol);
  }, []);

  const handleBpmChange = useCallback((bpm: number) => {
    setBpmOverride(bpm);
    beatEngine.setBpm(bpm);
  }, []);

  const handleFilterChange = useCallback((freq: number) => {
    setFilterCutoff(freq);
    beatEngine.setFilterCutoff(freq);
  }, []);

  const handleMixerChange = useCallback((next: StemMixerState) => {
    setMixer(next);
    beatEngine.setMixer(next);
  }, []);

  const handleToggleStep = useCallback(
    (channel: StemChannelKey, stepIdx: number) => {
      setPattern((prev) => {
        const next = clonePattern(prev);
        if (channel === 'drums' || channel === 'perc') {
          next[channel][stepIdx] = !next[channel][stepIdx];
        } else if (channel === 'sub808') {
          const fallbackFreq =
            activeTrack.pattern.sub808.find((v) => v !== null) ?? 55.0;
          next.sub808[stepIdx] =
            next.sub808[stepIdx] !== null ? null : fallbackFreq;
        } else {
          const fallbackFreq =
            activeTrack.pattern.melodic.find((v) => v !== null) ?? 329.63;
          next.melodic[stepIdx] =
            next.melodic[stepIdx] !== null ? null : fallbackFreq;
        }
        beatEngine.updatePattern(next);
        return next;
      });
    },
    [activeTrack]
  );

  const handleResetPattern = useCallback(() => {
    const restored = clonePattern(activeTrack.pattern);
    setPattern(restored);
    beatEngine.updatePattern(restored);
  }, [activeTrack]);

  const handleToggleCrate = useCallback((trackId: string) => {
    setCrateIds((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId]
    );
  }, []);

  const handleOpenDeck = useCallback(
    (track: Track) => {
      if (activeTrack.id !== track.id) {
        loadTrackIntoEngine(track, isPlaying);
      }
      setActiveView('deck');
    },
    [activeTrack.id, isPlaying, loadTrackIntoEngine]
  );

  const handleSelectRelease = useCallback((code: string) => {
    setSelectedReleaseCode(code);
    setActiveView('releases');
  }, []);

  const handleAddPackToCrate = useCallback((trackIds: string[]) => {
    setCrateIds((prev) => Array.from(new Set([...prev, ...trackIds])));
  }, []);

  return (
    <div className="min-h-screen bg-[#050506] text-[#f4f4f5] flex flex-col">
      <TopNav
        activeView={activeView}
        onChangeView={setActiveView}
        crateCount={crateIds.length}
        onPrimaryAction={() =>
          setActiveView(activeView === 'crate' ? 'deck' : 'crate')
        }
      />

      <main className="flex-1">
        {activeView === 'catalog' && (
          <CatalogView
            activeTrack={activeTrack}
            isPlaying={isPlaying}
            crateIds={crateIds}
            onPlayTrack={handlePlayTrack}
            onToggleCrate={handleToggleCrate}
            onOpenDeck={handleOpenDeck}
            onSelectRelease={handleSelectRelease}
          />
        )}

        {activeView === 'deck' && (
          <DeckView
            track={activeTrack}
            isPlaying={isPlaying}
            currentStep={currentStep}
            bpmOverride={bpmOverride}
            filterCutoff={filterCutoff}
            mixer={mixer}
            pattern={pattern}
            inCrate={crateIds.includes(activeTrack.id)}
            onSelectTrack={(t) => loadTrackIntoEngine(t, isPlaying)}
            onTogglePlay={handleTogglePlay}
            onBpmChange={handleBpmChange}
            onFilterChange={handleFilterChange}
            onMixerChange={handleMixerChange}
            onToggleStep={handleToggleStep}
            onResetPattern={handleResetPattern}
            onToggleCrate={() => handleToggleCrate(activeTrack.id)}
          />
        )}

        {activeView === 'crate' && (
          <CrateView
            crateIds={crateIds}
            activeTrack={activeTrack}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayTrack}
            onOpenDeck={handleOpenDeck}
            onRemoveFromCrate={(id) =>
              setCrateIds((prev) => prev.filter((x) => x !== id))
            }
            onClearCrate={() => setCrateIds([])}
            onLoadStarterCrate={() => setCrateIds(STARTER_CRATE)}
            onGoCatalog={() => setActiveView('catalog')}
          />
        )}

        {activeView === 'releases' && (
          <ReleasesView
            selectedCode={selectedReleaseCode}
            activeTrack={activeTrack}
            isPlaying={isPlaying}
            crateIds={crateIds}
            onSelectCode={setSelectedReleaseCode}
            onPlayTrack={handlePlayTrack}
            onOpenDeck={handleOpenDeck}
            onToggleCrate={handleToggleCrate}
            onAddPackToCrate={handleAddPackToCrate}
          />
        )}
      </main>

      <TransportDeck
        track={activeTrack}
        isPlaying={isPlaying}
        progress={progress}
        volume={volume}
        onTogglePlay={handleTogglePlay}
        onPrev={handlePrev}
        onNext={handleNext}
        onScrub={handleScrub}
        onVolumeChange={handleVolumeChange}
        onOpenDeck={() => setActiveView('deck')}
      />
    </div>
  );
}
