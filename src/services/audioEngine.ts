/**
 * High-fidelity Web Audio API Procedural Ambient Sound Synthesizer
 * Generates rich, relaxing, continuous ambient soundscapes without external audio asset dependencies.
 */

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private currentType: string | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private activeNodes: (AudioNode | number)[] = [];
  private volume = 0.65;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentType(): string | null {
    return this.currentType;
  }

  public stop() {
    if (this.activeNodes.length > 0) {
      this.activeNodes.forEach(node => {
        if (typeof node === 'number') {
          clearInterval(node);
          clearTimeout(node);
        } else {
          try {
            if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
              (node as AudioScheduledSourceNode).stop();
            }
            node.disconnect();
          } catch {
            // ignore cleanup errors
          }
        }
      });
      this.activeNodes = [];
    }
    this.isPlaying = false;
    this.currentType = null;
  }

  public play(type: string) {
    this.initContext();
    if (!this.ctx) return;

    this.stop();
    this.currentType = type;
    this.isPlaying = true;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    switch (type) {
      case 'rain':
        this.generateRain();
        break;
      case 'waves':
        this.generateOceanWaves();
        break;
      case 'forest':
        this.generateForestWind();
        break;
      case 'fire':
        this.generateFireplace();
        break;
      case 'lofi':
        this.generateLofiChords();
        break;
      case 'whitenoise':
        this.generatePureBrownNoise();
        break;
      case 'cafe':
        this.generateCafeAmbience();
        break;
      default:
        this.generateRain();
        break;
    }
  }

  // --- Rain Generator ---
  private generateRain() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1100;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.45;

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    whiteNoise.start();

    this.activeNodes.push(whiteNoise, filter, gain);

    // Random raindrops
    const interval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const osc = this.ctx.createOscillator();
      const dropGain = this.ctx.createGain();
      osc.type = 'sine';
      const freq = 1200 + Math.random() * 1600;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.3, this.ctx.currentTime + 0.08);

      dropGain.gain.setValueAtTime(0.06 * Math.random(), this.ctx.currentTime);
      dropGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

      osc.connect(dropGain);
      dropGain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    }, 180);

    this.activeNodes.push(interval);
  }

  // --- Ocean Waves Generator ---
  private generateOceanWaves() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 450;

    const swellGain = this.ctx.createGain();
    swellGain.gain.value = 0.4;

    // LFO for periodic wave crashing
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.12; // slow wave cycle (~8 sec)

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.35;

    lfo.connect(lfoGain);
    lfoGain.connect(swellGain.gain);

    noise.connect(filter);
    filter.connect(swellGain);
    swellGain.connect(this.masterGain);

    noise.start();
    lfo.start();

    this.activeNodes.push(noise, filter, swellGain, lfo, lfoGain);
  }

  // --- Forest Wind Generator ---
  private generateForestWind() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 350;
    bandpass.Q.value = 1.8;

    const windGain = this.ctx.createGain();
    windGain.gain.value = 0.4;

    // gentle wind modulation
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.2;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);

    noise.connect(bandpass);
    bandpass.connect(windGain);
    windGain.connect(this.masterGain);

    noise.start();
    lfo.start();

    this.activeNodes.push(noise, bandpass, windGain, lfo, lfoGain);

    // Rare distant forest chime
    const birdInterval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      if (Math.random() > 0.45) return;
      const chime = this.ctx.createOscillator();
      const cGain = this.ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(2400 + Math.random() * 800, this.ctx.currentTime);
      cGain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      cGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);

      chime.connect(cGain);
      cGain.connect(this.masterGain);
      chime.start();
      chime.stop(this.ctx.currentTime + 0.4);
    }, 2800);

    this.activeNodes.push(birdInterval);
  }

  // --- Fireplace Generator ---
  private generateFireplace() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      last = (last + 0.05 * (Math.random() * 2 - 1)) / 1.05;
      output[i] = last * 2.8;
    }

    const roar = this.ctx.createBufferSource();
    roar.buffer = noiseBuffer;
    roar.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 220;

    const roarGain = this.ctx.createGain();
    roarGain.gain.value = 0.55;

    roar.connect(lowpass);
    lowpass.connect(roarGain);
    roarGain.connect(this.masterGain);
    roar.start();

    this.activeNodes.push(roar, lowpass, roarGain);

    // Crackle snaps
    const crackleInterval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      if (Math.random() > 0.35) return;
      const snap = this.ctx.createOscillator();
      const sGain = this.ctx.createGain();
      snap.type = 'square';
      snap.frequency.setValueAtTime(120 + Math.random() * 300, this.ctx.currentTime);
      sGain.gain.setValueAtTime(0.07 * Math.random(), this.ctx.currentTime);
      sGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.03);

      snap.connect(sGain);
      sGain.connect(this.masterGain);
      snap.start();
      snap.stop(this.ctx.currentTime + 0.04);
    }, 120);

    this.activeNodes.push(crackleInterval);
  }

  // --- Lo-Fi Ambient Chord Pads ---
  private generateLofiChords() {
    if (!this.ctx || !this.masterGain) return;

    // Chords (Cmaj9, Am9, Fmaj7 progression frequencies)
    const chordPitches = [
      [261.63, 329.63, 392.00, 493.88], // C E G B
      [220.00, 261.63, 329.63, 392.00], // A C E G
      [174.61, 220.00, 261.63, 329.63], // F A C E
      [196.00, 246.94, 293.66, 392.00]  // G B D G
    ];

    let chordIdx = 0;
    const playNextChord = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      const pitches = chordPitches[chordIdx % chordPitches.length];
      chordIdx++;

      pitches.forEach((f, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f * 0.5, this.ctx.currentTime); // 1 octave lower for warmth

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, this.ctx.currentTime);

        const duration = 5.8;
        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      });
    };

    playNextChord();
    const chordInterval = window.setInterval(playNextChord, 5500);
    this.activeNodes.push(chordInterval);
  }

  // --- Pure Brown Noise ---
  private generatePureBrownNoise() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 650;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.42;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();

    this.activeNodes.push(noise, filter, gain);
  }

  // --- Cafe Ambience ---
  private generateCafeAmbience() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 600;
    bandpass.Q.value = 1.0;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.28;

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterGain);
    noise.start();

    this.activeNodes.push(noise, bandpass, gain);

    // Cup clinks
    const clinkInterval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;
      if (Math.random() > 0.4) return;
      const osc = this.ctx.createOscillator();
      const clinkGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(3200 + Math.random() * 800, this.ctx.currentTime);
      clinkGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      clinkGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);

      osc.connect(clinkGain);
      clinkGain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    }, 2200);

    this.activeNodes.push(clinkInterval);
  }
}

export const ambientEngine = new AmbientAudioEngine();
