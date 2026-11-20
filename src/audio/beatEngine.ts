import { StemMixerState, StemPattern, Track } from '../types/audio';

class BeatAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;

  private isPlaying = false;
  private currentStep = 0;
  private nextNoteTime = 0;
  private timerId: number | null = null;

  private bpm = 96;
  private volume = 0.8;
  private filterCutoff = 16000;
  private pattern: StemPattern | null = null;
  private mixer: StemMixerState = {
    drums: { muted: false, solo: false, gain: 0.9 },
    sub808: { muted: false, solo: false, gain: 0.92 },
    perc: { muted: false, solo: false, gain: 0.78 },
    melodic: { muted: false, solo: false, gain: 0.72 },
  };

  private onStepCallback: ((step: number) => void) | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private ensureContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();

      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.value = this.filterCutoff;
      this.filterNode.Q.value = 1.2;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.72;

      this.filterNode.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // Prebuild noise buffer for snares/hats
      const bufSize = this.ctx.sampleRate * 0.5;
      this.noiseBuffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  public setTrack(track: Track) {
    this.bpm = track.bpm;
    this.pattern = {
      drums: [...track.pattern.drums],
      perc: [...track.pattern.perc],
      sub808: [...track.pattern.sub808],
      melodic: [...track.pattern.melodic],
    };
  }

  public updatePattern(pattern: StemPattern) {
    this.pattern = pattern;
  }

  public setBpm(bpm: number) {
    this.bpm = Math.max(70, Math.min(160, bpm));
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.015);
    }
  }

  public setFilterCutoff(freq: number) {
    this.filterCutoff = Math.max(200, Math.min(18000, freq));
    if (this.filterNode && this.ctx) {
      this.filterNode.frequency.setTargetAtTime(
        this.filterCutoff,
        this.ctx.currentTime,
        0.02
      );
    }
  }

  public setMixer(mixer: StemMixerState) {
    this.mixer = mixer;
  }

  public setStep(step: number) {
    this.currentStep = ((step % 16) + 16) % 16;
  }

  public onStep(cb: (step: number) => void) {
    this.onStepCallback = cb;
  }

  public start() {
    this.ensureContext();
    if (this.isPlaying || !this.ctx) return;
    this.isPlaying = true;
    this.nextNoteTime = this.ctx.currentTime + 0.04;
    this.scheduler();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private isChannelAudible(key: keyof StemMixerState): boolean {
    const anySolo = Object.values(this.mixer).some((ch) => ch.solo);
    const ch = this.mixer[key];
    if (anySolo) return ch.solo && !ch.muted;
    return !ch.muted;
  }

  private scheduler = () => {
    if (!this.isPlaying || !this.ctx) return;

    const scheduleAheadTime = 0.1;
    while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
      this.scheduleStep(this.currentStep, this.nextNoteTime);
      const secondsPer16th = 60.0 / this.bpm / 4.0;
      this.nextNoteTime += secondsPer16th;
      this.currentStep = (this.currentStep + 1) % 16;
    }

    this.timerId = window.setTimeout(this.scheduler, 25);
  };

  private scheduleStep(step: number, time: number) {
    if (this.onStepCallback) {
      const capturedStep = step;
      const delay = Math.max(0, (time - (this.ctx?.currentTime ?? 0)) * 1000);
      window.setTimeout(() => {
        if (this.isPlaying) {
          this.onStepCallback?.(capturedStep);
        }
      }, delay);
    }

    if (!this.ctx || !this.filterNode || !this.pattern) return;

    // 1. Drums (Kick on main beats, Dembow snare on syncopations)
    if (this.pattern.drums[step] && this.isChannelAudible('drums')) {
      const gainVal = this.mixer.drums.gain;
      const isKick = step % 4 === 0;
      if (isKick) {
        this.triggerKick(this.ctx, this.filterNode, time, gainVal);
      } else {
        this.triggerSnare(this.ctx, this.filterNode, time, gainVal * 0.88);
      }
    }

    // 2. Perc (Hi-hat / Rimshot)
    if (this.pattern.perc[step] && this.isChannelAudible('perc')) {
      const gainVal = this.mixer.perc.gain;
      this.triggerHat(this.ctx, this.filterNode, time, gainVal * 0.45);
    }

    // 3. 808 Sub Bass
    const subFreq = this.pattern.sub808[step];
    if (subFreq && this.isChannelAudible('sub808')) {
      this.trigger808(
        this.ctx,
        this.filterNode,
        time,
        subFreq,
        this.mixer.sub808.gain * 0.85
      );
    }

    // 4. Melodic Chop
    const melFreq = this.pattern.melodic[step];
    if (melFreq && this.isChannelAudible('melodic')) {
      this.triggerMelodic(
        this.ctx,
        this.filterNode,
        time,
        melFreq,
        this.mixer.melodic.gain * 0.38
      );
    }
  }

  private triggerKick(
    ctx: BaseAudioContext,
    dest: AudioNode,
    time: number,
    level: number
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(145, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.09);

    gain.gain.setValueAtTime(level * 0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.23);
  }

  private triggerSnare(
    ctx: BaseAudioContext,
    dest: AudioNode,
    time: number,
    level: number
  ) {
    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1950, time);
      bp.Q.value = 1.1;

      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(level * 0.7, time);
      nGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

      noise.connect(bp);
      bp.connect(nGain);
      nGain.connect(dest);
      noise.start(time);
      noise.stop(time + 0.13);
    }

    const body = ctx.createOscillator();
    const bGain = ctx.createGain();
    body.type = 'triangle';
    body.frequency.setValueAtTime(210, time);
    body.frequency.exponentialRampToValueAtTime(115, time + 0.07);
    bGain.gain.setValueAtTime(level * 0.5, time);
    bGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);
    body.connect(bGain);
    bGain.connect(dest);
    body.start(time);
    body.stop(time + 0.1);
  }

  private triggerHat(
    ctx: BaseAudioContext,
    dest: AudioNode,
    time: number,
    level: number
  ) {
    if (!this.noiseBuffer) return;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(7200, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(level * 0.45, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

    noise.connect(hp);
    hp.connect(gain);
    gain.connect(dest);
    noise.start(time);
    noise.stop(time + 0.05);
  }

  private trigger808(
    ctx: BaseAudioContext,
    dest: AudioNode,
    time: number,
    freq: number,
    level: number
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq * 1.12, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.035);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(level, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.42);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.44);
  }

  private triggerMelodic(
    ctx: BaseAudioContext,
    dest: AudioNode,
    time: number,
    freq: number,
    level: number
  ) {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, time);
    filter.frequency.exponentialRampToValueAtTime(480, time + 0.2);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(level, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.24);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.25);
  }

  public getSpectrumBars(count = 24): number[] {
    if (!this.analyser || !this.isPlaying) {
      return Array.from({ length: count }, () => 0.08);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    const out: number[] = [];
    const step = Math.max(1, Math.floor(data.length / count));
    for (let i = 0; i < count; i++) {
      const val = data[i * step] ?? 0;
      out.push(Math.max(0.08, Math.min(1, val / 220)));
    }
    return out;
  }

  public async renderTrackWavBlob(track: Track): Promise<Blob> {
    const sampleRate = 44100;
    const stepDuration = 60 / track.bpm / 4;
    const totalBars = 2;
    const totalSteps = 16 * totalBars;
    const totalDuration = stepDuration * totalSteps + 0.4;

    const offline = new OfflineAudioContext(
      1,
      Math.ceil(sampleRate * totalDuration),
      sampleRate
    );

    const bufSize = Math.floor(sampleRate * 0.4);
    const nBuf = offline.createBuffer(1, bufSize, sampleRate);
    const nData = nBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) nData[i] = Math.random() * 2 - 1;
    this.noiseBuffer = nBuf;

    const master = offline.createGain();
    master.gain.value = 0.85;
    master.connect(offline.destination);

    for (let bar = 0; bar < totalBars; bar++) {
      for (let step = 0; step < 16; step++) {
        const time = (bar * 16 + step) * stepDuration + 0.02;
        if (track.pattern.drums[step]) {
          if (step % 4 === 0) {
            this.triggerKick(offline, master, time, 0.9);
          } else {
            this.triggerSnare(offline, master, time, 0.78);
          }
        }
        if (track.pattern.perc[step]) {
          this.triggerHat(offline, master, time, 0.35);
        }
        const sub = track.pattern.sub808[step];
        if (sub) {
          this.trigger808(offline, master, time, sub, 0.75);
        }
        const mel = track.pattern.melodic[step];
        if (mel) {
          this.triggerMelodic(offline, master, time, mel, 0.3);
        }
      }
    }

    const rendered = await offline.startRendering();
    return audioBufferToWavBlob(rendered);
  }
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const samples = buffer.getChannelData(0);
  const dataLength = samples.length * 2;
  const arrayBuffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(arrayBuffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

export const beatEngine = new BeatAudioEngine();
