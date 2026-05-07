class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxEnabled: boolean = true;
  private bgmEnabled: boolean = true;
  private lastDrawTime: number = 0;

  private bgmAudio: HTMLAudioElement | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const savedSfx = localStorage.getItem('pixel_sfx_enabled');
    if (savedSfx !== null) this.sfxEnabled = savedSfx === 'true';
    const savedBgm = localStorage.getItem('pixel_bgm_enabled');
    if (savedBgm !== null) this.bgmEnabled = savedBgm === 'true';
  }

  setBgm(audio: HTMLAudioElement | null) {
    this.bgmAudio = audio;
    this.updateBgmState();
  }

  isSfxEnabled() { return this.sfxEnabled; }
  isBgmEnabled() { return this.bgmEnabled; }

  setSfxEnabled(val: boolean) {
    this.sfxEnabled = val;
    localStorage.setItem('pixel_sfx_enabled', String(val));
  }

  setBgmEnabled(val: boolean) {
    this.bgmEnabled = val;
    localStorage.setItem('pixel_bgm_enabled', String(val));
    this.updateBgmState();
  }

  isEnabled() { return this.sfxEnabled || this.bgmEnabled; } // Legacy fallback if needed

  private updateBgmState() {
    if (this.bgmAudio) {
      if (this.bgmEnabled) {
        this.bgmAudio.play().catch(() => {});
      } else {
        this.bgmAudio.pause();
      }
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
    if (!this.sfxEnabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  private createNoiseBuffer(duration: number) {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  playDraw(muffle: number = 0, speed: number = 1) {
    if (!this.sfxEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    // Throttle drawing sounds slightly to avoid overlapping harshness
    if (now - this.lastDrawTime < 0.015 / speed) return;
    this.lastDrawTime = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    osc.type = 'sine';
    // Frequency shifts: higher speed -> higher pitch
    const baseFreq = 200 + Math.random() * 30;
    osc.frequency.setValueAtTime(baseFreq * speed, now);
    
    filter.type = 'lowpass';
    // Muffle shifts: higher muffle -> lower cutoff
    const baseCutoff = 2000;
    const cutoff = Math.max(60, baseCutoff - (muffle * 1800));
    filter.frequency.setValueAtTime(cutoff, now);
    // Add resonance for the "vacuum" feel when muffled
    filter.Q.setValueAtTime(muffle * 10, now);

    const duration = 0.08 / speed;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.01 / speed);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Noise component for scratchiness
    const noiseBuffer = this.createNoiseBuffer(duration);
    if (noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.01 * (1 - muffle), now);
      noise.connect(noiseGain);
      noiseGain.connect(filter);
      noise.start(now);
    }
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + duration);
  }

  playErase(muffle: number = 0, speed: number = 1) {
    if (!this.sfxEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (now - this.lastDrawTime < 0.03 / speed) return;
    this.lastDrawTime = now;

    // Use a short burst of filtered noise for erasing
    const duration = 0.05 / speed;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const baseCutoff = 600;
    const cutoff = Math.max(80, baseCutoff - (muffle * 400));
    filter.frequency.setValueAtTime(cutoff, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.02, now + 0.01 / speed);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  playFill(muffle: number = 0, speed: number = 1) {
    if (!this.sfxEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    osc.type = 'sine';
    const baseFreq = 150 * speed;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(400 * speed, now + 0.15 / speed);
    
    filter.type = 'lowpass';
    const baseCutoff = 1000;
    const cutoff = Math.max(100, baseCutoff - (muffle * 600));
    filter.frequency.setValueAtTime(cutoff, now);
    filter.Q.setValueAtTime(muffle * 5, now);

    const duration = 0.2 / speed;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.02 / speed);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + duration);
  }

  private clickAudio = new Audio('/click.mp3');
  private colorAudio = new Audio('/color_sound.mp3');

  playClick() {
    if (!this.sfxEnabled) return;
    try {
      this.clickAudio.volume = 0.2;
      this.clickAudio.currentTime = 0;
      this.clickAudio.play().catch(() => {});
    } catch (e) {
      console.error(e);
    }
  }

  playColorSound() {
    if (!this.sfxEnabled) return;
    try {
      this.colorAudio.volume = 0.4;
      this.colorAudio.currentTime = 0;
      this.colorAudio.play().catch(() => {});
    } catch (e) {
      console.error(e);
    }
  }

  playAction() {
    if (!this.sfxEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playError() {
    if (!this.sfxEnabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }
}

export const sound = new SoundEngine();
