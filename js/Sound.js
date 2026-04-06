class Sound {
  constructor() {
    this.ctx = null;
  }

  ensure() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  tone(freq, dur, type = 'square', vol = 0.12) {
    this.ensure();
    let osc = this.ctx.createOscillator();
    let gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + dur);
  }

  shoot() {
    this.tone(500, 0.04, 'square', 0.06);
  }

  virusKill() {
    this.tone(800, 0.07, 'square', 0.1);
    setTimeout(() => this.tone(1200, 0.05, 'square', 0.08), 35);
  }

  sourceHit() {
    this.tone(250, 0.12, 'sawtooth', 0.12);
  }

  sourceDestroy() {
    this.tone(600, 0.08, 'square', 0.1);
    setTimeout(() => this.tone(800, 0.08, 'square', 0.1), 50);
    setTimeout(() => this.tone(1100, 0.12, 'square', 0.1), 100);
  }

  playerHit() {
    this.tone(120, 0.25, 'sawtooth', 0.15);
  }

  bounce() {
    this.tone(350, 0.04, 'triangle', 0.06);
  }

  wallHit() {
    this.tone(180, 0.06, 'square', 0.05);
  }
}
