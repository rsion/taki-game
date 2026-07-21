'use client';

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private _enabled: boolean = true;
  private initialized: boolean = false;

  get enabled() {
    return this._enabled;
  }

  preload(name: string, path: string) {
    if (typeof window === 'undefined') return;
    try {
      const audio = new Audio(path);
      audio.preload = 'auto';
      this.sounds.set(name, audio);
    } catch {
      // Ignore preload failures
    }
  }

  play(name: string) {
    if (!this._enabled || typeof window === 'undefined') return;
    const audio = this.sounds.get(name);
    if (!audio) return;
    try {
      // Clone for overlapping playback
      const clone = audio.cloneNode(true) as HTMLAudioElement;
      clone.volume = 0.6;
      clone.play().catch(() => {});
    } catch {
      // Ignore play failures
    }
  }

  toggle(): boolean {
    this._enabled = !this._enabled;
    return this._enabled;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.preload('play_card', '/sounds/play_card.wav');
    this.preload('draw_card', '/sounds/draw_card.wav');
    this.preload('win', '/sounds/win.wav');
    this.preload('lose', '/sounds/lose.wav');
    this.preload('plus_two', '/sounds/plus_two.wav');
    this.preload('stop', '/sounds/stop.wav');
    this.preload('direction', '/sounds/direction.wav');
    this.preload('color_change', '/sounds/color_change.wav');
    this.preload('last_card', '/sounds/last_card.wav');
    this.preload('deal', '/sounds/deal.wav');
    this.preload('illegal_move', '/sounds/illegal_move.wav');
    this.preload('pass_turn', '/sounds/pass_turn.wav');
    this.preload('draw_after_plus2', '/sounds/draw_after_plus2.wav');
  }
}

export const soundManager = new SoundManager();
