export type AppView = 'catalog' | 'deck' | 'crate' | 'releases';

export type Genre = 'LATIN TRAP' | 'DEMBOW' | 'UNDERGROUND' | 'NEO-PERREO';

export type StemChannelKey = 'drums' | 'sub808' | 'perc' | 'melodic';

export interface StemPattern {
  drums: boolean[]; // 16 steps: kick + snare
  perc: boolean[]; // 16 steps: dembow rim / hi-hat / shaker
  sub808: (number | null)[]; // 16 steps: Hz or null
  melodic: (number | null)[]; // 16 steps: Hz or null
}

export interface Track {
  id: string;
  index: string; // '01', '02', etc.
  releaseCode: string;
  title: string;
  artist: string;
  genre: Genre;
  bpm: number;
  musicalKey: string;
  durationSec: number;
  durationLabel: string;
  sampleRate: string; // e.g. '24-BIT / 48KHZ'
  stemsCount: number;
  lufs: string;
  waveform: number[]; // 48 normalized bars 0.15..1.0
  pattern: StemPattern;
  accentColor: 'crimson' | 'amber';
  coverVariant: number;
}

export interface ReleasePack {
  code: string;
  title: string;
  subtitle: string;
  producer: string;
  city: string;
  year: string;
  genre: Genre;
  bpmRange: string;
  specs: string;
  description: string;
  coverVariant: number;
  accentColor: 'crimson' | 'amber';
  trackIds: string[];
}

export interface StemMixerState {
  drums: { muted: boolean; solo: boolean; gain: number };
  sub808: { muted: boolean; solo: boolean; gain: number };
  perc: { muted: boolean; solo: boolean; gain: number };
  melodic: { muted: boolean; solo: boolean; gain: number };
}

export type ExportFormat =
  | 'WAV_24_48'
  | 'WAV_16_44'
  | 'STEM_BUNDLE'
  | 'MP3_320';
