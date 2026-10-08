import { midiToHz } from "./layout";
import { getSettings } from "./settings";

interface Voice {
  oscillators: OscillatorNode[];
  gain: GainNode;
}

// Everything is synthesised, no audio files: a mechanical click from a noise burst plus a
// short low "thock", and a simple held-note voice for the synth mode.
class KeySound {
  private ctx = new AudioContext();
  private master = this.ctx.createGain();
  private noise: AudioBuffer;
  private voices = new Map<string, Voice>();

  constructor() {
    // The compressor keeps a chord of held notes from clipping.
    const compressor = this.ctx.createDynamicsCompressor();
    this.master.gain.value = 0.7;
    this.master.connect(compressor).connect(this.ctx.destination);

    this.noise = this.ctx.createBuffer(1, Math.round(this.ctx.sampleRate * 0.15), this.ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }

  resume() {
    if (this.ctx.state !== "running") void this.ctx.resume();
  }

  // pitch scales the whole sound (big keys are lower); level is loudness.
  click(pitch = 1, level = 1) {
    const { ctx } = this;
    const t = ctx.currentTime;
    const jitter = 0.94 + Math.random() * 0.12;

    const burst = ctx.createBufferSource();
    burst.buffer = this.noise;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 2400 * pitch * jitter;
    band.Q.value = 0.9;
    const burstGain = ctx.createGain();
    burstGain.gain.setValueAtTime(0.0001, t);
    burstGain.gain.linearRampToValueAtTime(0.5 * level, t + 0.001);
    burstGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    burst.connect(band).connect(burstGain).connect(this.master);
    burst.start(t, Math.random() * 0.08, 0.06);

    const thock = ctx.createOscillator();
    thock.type = "sine";
    thock.frequency.setValueAtTime(190 * pitch * jitter, t);
    thock.frequency.exponentialRampToValueAtTime(70 * pitch, t + 0.05);
    const thockGain = ctx.createGain();
    thockGain.gain.setValueAtTime(0.0001, t);
    thockGain.gain.linearRampToValueAtTime(0.55 * level, t + 0.002);
    thockGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    thock.connect(thockGain).connect(this.master);
    thock.start(t);
    thock.stop(t + 0.1);
  }

  noteOn(code: string, midi: number) {
    this.noteOff(code);
    const { ctx } = this;
    const t = ctx.currentTime;
    const freq = midiToHz(midi);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.008);
    gain.gain.setTargetAtTime(0.17, t + 0.01, 0.15);

    // Bright at the start, then settles, like a plucked tone.
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(Math.min(freq * 9, 9000), t);
    filter.frequency.setTargetAtTime(Math.min(freq * 3, 3500), t + 0.01, 0.2);
    filter.connect(gain).connect(this.master);

    const parts: [OscillatorType, number, number][] = [
      ["triangle", 1, 1],
      ["sine", 2, 0.25],
      ["sawtooth", 1.003, 0.1],
    ];
    const oscillators = parts.map(([type, ratio, level]) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq * ratio;
      const partGain = ctx.createGain();
      partGain.gain.value = level;
      osc.connect(partGain).connect(filter);
      osc.start(t);
      return osc;
    });

    this.voices.set(code, { oscillators, gain });
    this.click(1.5, 0.25);
  }

  noteOff(code: string) {
    const voice = this.voices.get(code);
    if (!voice) return;
    this.voices.delete(code);
    const t = this.ctx.currentTime;
    voice.gain.gain.cancelScheduledValues(t);
    voice.gain.gain.setTargetAtTime(0, t, 0.12);
    for (const osc of voice.oscillators) osc.stop(t + 0.7);
  }

  releaseAll() {
    for (const code of [...this.voices.keys()]) this.noteOff(code);
  }
}

let instance: KeySound | null = null;

// Returns null while muted. The first call has to come from a user gesture so the browser
// lets the audio context start.
export function getSound(): KeySound | null {
  if (getSettings().sound === "off") return null;
  instance ??= new KeySound();
  instance.resume();
  return instance;
}

export function releaseNote(code: string) {
  instance?.noteOff(code);
}

export function silence() {
  instance?.releaseAll();
}

// A crisp, higher click for interface changes such as switching theme.
export function uiClick() {
  getSound()?.click(1.35, 0.9);
}
