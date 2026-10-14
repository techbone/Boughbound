import type { GameEvent } from '../game/types';

export class Soundscape {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private voices = new Set<OscillatorNode>();
  private noteIndex = 0;
  muted = false;

  async unlock(): Promise<void> {
    try {
      this.context ??= new AudioContext();
      if (!this.master) { this.master = this.context.createGain(); this.master.gain.value = this.muted ? 0 : .22; this.master.connect(this.context.destination); }
      await this.context.resume();
    } catch { /* Audio unavailable: keep the game playable. */ }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.context && this.master) this.master.gain.setTargetAtTime(muted ? 0 : .22, this.context.currentTime, .035);
  }

  stop(): void {
    for (const voice of this.voices) { try { voice.stop(); } catch { /* Already stopped. */ } }
    this.voices.clear(); this.noteIndex = 0;
  }

  event(event: GameEvent): void {
    if (this.muted) return;
    const notes = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25];
    if (event.kind === 'light') { this.tone(notes[this.noteIndex++ % notes.length], .6, .25); }
    if (event.kind === 'fork') { [329.63, 440, 659.25].forEach((f, i) => this.tone(f, 1.3, .22, i * .09)); }
    if (event.kind === 'prune') this.tone(130.81, .35, .16);
    if (event.kind === 'lose') [196, 164.81, 130.81].forEach((f, i) => this.tone(f, 1.3, .2, i * .14));
    if (event.kind === 'win') [261.63, 329.63, 392, 523.25, 659.25].forEach((f, i) => this.tone(f, 2, .22, i * .15));
  }

  private tone(frequency: number, duration: number, volume: number, delay = 0): void {
    const context = this.context; const master = this.master;
    if (!context || !master || context.state !== 'running' || this.voices.size >= 16) return;
    const oscillator = context.createOscillator(); const gain = context.createGain();
    const time = context.currentTime + delay;
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, time);
    gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(volume, time + .012);
    gain.gain.exponentialRampToValueAtTime(.001, time + duration);
    oscillator.connect(gain); gain.connect(master); this.voices.add(oscillator);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); this.voices.delete(oscillator); };
    oscillator.start(time); oscillator.stop(time + duration + .02);
  }
}
