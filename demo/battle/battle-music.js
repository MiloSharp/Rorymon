const BASE_FREQUENCY = 440 * 2 ** (-69 / 12);
const frequency = (midi) => BASE_FREQUENCY * 2 ** (midi / 12);

// Original four-channel theme modeled after late-1990s handheld sound chips.
export class BattleMusic {
  constructor() {
    this.context = null;
    this.master = null;
    this.timer = null;
    this.noiseBuffer = null;
    this.step = 0;
    this.nextNoteAt = 0;
    this.stepLength = 60 / 154 / 4;
  }

  playTone(midi, start, duration, type, volume, detune = 0) {
    if (midi == null || !this.context) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency(midi), start);
    oscillator.detune.setValueAtTime(detune, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.006);
    gain.gain.setValueAtTime(volume * 0.78, start + Math.max(0.008, duration * 0.55));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(this.master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.015);
  }

  playNoise(start, duration, volume) {
    if (!this.context || !this.noiseBuffer) return;
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    source.buffer = this.noiseBuffer;
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(duration > 0.05 ? 900 : 4200, start);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter).connect(gain).connect(this.master);
    source.start(start);
    source.stop(start + duration);
  }

  playKick(start) {
    if (!this.context) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(105, start);
    oscillator.frequency.exponentialRampToValueAtTime(45, start + 0.055);
    gain.gain.setValueAtTime(0.12, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.07);
    oscillator.connect(gain).connect(this.master);
    oscillator.start(start);
    oscillator.stop(start + 0.075);
  }

  scheduleStep(step, time) {
    const melody = [
      74, 74, null, 72, 69, null, 72, 74,
      77, null, 76, 74, 72, 69, 67, null,
      69, 69, null, 72, 74, null, 77, 76,
      74, 72, 69, 71, 72, null, 67, null,
    ];
    const roots = [38, 38, 41, 41, 36, 36, 43, 45];
    const chords = [[62,65,69],[62,65,69],[65,69,72],[65,69,72],[60,64,67],[60,64,67],[67,71,74],[69,72,76]];
    const index = step % melody.length;
    const phrase = Math.floor(index / 4) % roots.length;
    const arpeggio = chords[phrase][index % 3];

    this.playTone(melody[index], time, this.stepLength * 0.78, 'square', 0.16);
    this.playTone(arpeggio, time, this.stepLength * 0.46, 'square', 0.07, -7);
    if (index % 2 === 0) this.playTone(roots[phrase], time, this.stepLength * 1.65, 'triangle', 0.18);
    if (index % 4 === 0) this.playKick(time);
    if (index % 8 === 4) this.playNoise(time, 0.085, 0.105);
    else if (index % 2 === 0) this.playNoise(time, 0.024, 0.035);
  }

  async start() {
    if (this.timer) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = 0.07;
    this.master.connect(this.context.destination);
    this.noiseBuffer = this.context.createBuffer(1, this.context.sampleRate, this.context.sampleRate);
    const noise = this.noiseBuffer.getChannelData(0);
    let value = 1;
    for (let index = 0; index < noise.length; index += 1) {
      value = ((value << 1) ^ (value & 0x4000 ? 0x6000 : 0)) & 0x7fff;
      noise[index] = (value / 0x3fff) - 1;
    }

    await this.context.resume();
    this.step = 0;
    this.nextNoteAt = this.context.currentTime + 0.045;
    const schedule = () => {
      while (this.nextNoteAt < this.context.currentTime + 0.12) {
        this.scheduleStep(this.step, this.nextNoteAt);
        this.step += 1;
        this.nextNoteAt += this.stepLength;
      }
    };
    schedule();
    this.timer = window.setInterval(schedule, 35);
  }

  stop() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    if (this.context && this.master) {
      const context = this.context;
      const now = context.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(Math.max(this.master.gain.value, 0.0001), now);
      this.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      window.setTimeout(() => context.close(), 220);
    }
    this.context = null;
    this.master = null;
    this.noiseBuffer = null;
  }
}
