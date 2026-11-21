/** 효과음과 배경음. 소리 파일 없이 Web Audio로 그 자리에서 만든다.
 *  켜기 전에는 아무것도 만들지 않고, 브라우저 정책상 사용자가 누른 뒤에야 소리가 난다. */

export type Sfx = 'tick' | 'select' | 'back' | 'talk' | 'door' | 'serve';

// 배경음 — 사장조 5음(솔 라 시 레 미)으로 쓴 네 마디. 8분음표 여덟 칸이 한 마디, 0은 쉼
const N = { G2: 98, C3: 130.81, D3: 146.83, E2: 82.41, G4: 392, A4: 440, B4: 493.88, D5: 587.33, E5: 659.25, G5: 783.99 };
const MELODY = [
  N.D5, 0, N.E5, N.G5, 0, N.E5, N.D5, 0,
  N.B4, 0, N.D5, N.E5, 0, N.D5, N.B4, N.A4,
  N.G4, 0, N.A4, N.B4, 0, N.D5, N.E5, 0,
  N.D5, 0, N.B4, N.A4, 0, N.G4, N.A4, 0,
];
const BASS = [N.G2, N.E2, N.C3, N.D3];
const STEP = 60 / 92 / 2; // 8분음표 한 칸의 길이(초)

export class Sound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private boil: { source: AudioBufferSourceNode; gain: GainNode } | null = null;
  private bgmTimer = 0;
  private bgmStep = 0;
  private bgmNext = 0;
  private on = false;

  get enabled(): boolean {
    return this.on;
  }

  /** 소리를 켜거나 끈다. 사용자가 누른 자리에서 불러야 한다 */
  setEnabled(next: boolean): void {
    this.on = next;
    if (next) {
      const ctx = this.ensure();
      if (!ctx) return;
      void ctx.resume();
      this.master!.gain.setTargetAtTime(1, ctx.currentTime, 0.05);
      this.startBgm();
    } else if (this.ctx) {
      this.master!.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      this.stopBgm();
      this.setBoiling(false);
    }
  }

  play(name: Sfx): void {
    const ctx = this.on ? this.ensure() : null;
    if (!ctx) return;
    const t = ctx.currentTime;
    switch (name) {
      case 'tick':
        this.tone('square', 880, t, 0.04, 0.05);
        break;
      case 'talk':
        this.tone('square', 520 + Math.random() * 60, t, 0.035, 0.04);
        break;
      case 'select':
        this.tone('square', 660, t, 0.07, 0.08);
        this.tone('square', 990, t + 0.07, 0.12, 0.08);
        break;
      case 'back':
        this.tone('square', 660, t, 0.07, 0.07);
        this.tone('square', 440, t + 0.07, 0.12, 0.07);
        break;
      case 'serve':
        [N.G4, N.B4, N.D5, N.G5].forEach((freq, i) => this.tone('triangle', freq, t + i * 0.09, 0.3, 0.14));
        break;
      case 'door':
        this.swish(t);
        break;
    }
  }

  /** 국물 끓는 소리를 켜거나 끈다 */
  setBoiling(next: boolean): void {
    const ctx = this.ctx;
    if (!next) {
      if (!ctx || !this.boil) return;
      const { source, gain } = this.boil;
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
      source.stop(ctx.currentTime + 0.4);
      this.boil = null;
      return;
    }
    if (!this.on || this.boil || !ctx) return;
    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer(ctx);
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 520;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(0.16, ctx.currentTime, 0.1);
    // 보글거리게 소리 크기를 빠르게 흔든다
    const wobble = ctx.createOscillator();
    wobble.frequency.value = 11;
    const depth = ctx.createGain();
    depth.gain.value = 0.08;
    wobble.connect(depth).connect(gain.gain);
    wobble.start();
    source.connect(filter).connect(gain).connect(this.master!);
    source.start();
    source.onended = () => wobble.stop();
    this.boil = { source, gain };
  }

  dispose(): void {
    this.stopBgm();
    void this.ctx?.close();
    this.ctx = null;
    this.boil = null;
    this.on = false;
  }

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    if (typeof AudioContext === 'undefined') return null;
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);
    return this.ctx;
  }

  /** 짧게 울리고 사라지는 음 하나 */
  private tone(type: OscillatorType, freq: number, at: number, length: number, volume: number): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, at);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
    osc.connect(gain).connect(this.master!);
    osc.start(at);
    osc.stop(at + length + 0.02);
  }

  private noiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noise) return this.noise;
    const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.noise = buffer;
    return buffer;
  }

  /** 천이 걷히는 소리 — 걸러 낸 잡음이 높은 데서 낮은 데로 쓸려 간다 */
  private swish(at: number): void {
    const ctx = this.ctx!;
    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, at);
    filter.frequency.exponentialRampToValueAtTime(350, at + 0.5);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.2, at + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.55);
    source.connect(filter).connect(gain).connect(this.master!);
    source.start(at);
    source.stop(at + 0.6);
  }

  private startBgm(): void {
    const ctx = this.ctx;
    if (!ctx || this.bgmTimer) return;
    this.bgmStep = 0;
    this.bgmNext = ctx.currentTime + 0.1;
    // 조금 앞의 음까지 미리 예약해 두어 박자가 밀리지 않게 한다
    this.bgmTimer = window.setInterval(() => {
      while (this.bgmNext < ctx.currentTime + 0.3) {
        const step = this.bgmStep % MELODY.length;
        const note = MELODY[step];
        if (note) this.tone('square', note, this.bgmNext, STEP * 1.6, 0.028);
        if (step % 4 === 0) this.tone('triangle', BASS[Math.floor(step / 8)], this.bgmNext, STEP * 3.6, 0.09);
        this.bgmStep += 1;
        this.bgmNext += STEP;
      }
    }, 100);
  }

  private stopBgm(): void {
    window.clearInterval(this.bgmTimer);
    this.bgmTimer = 0;
  }
}
