// Audio and Haptic feedback utility

class FeedbackService {
  private audioCtx: AudioContext | null = null;

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  // Key press tap sound
  playTap(enabled: boolean = true) {
    if (!enabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.audioCtx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.03);
    } catch {
      // Audio autoplay policy or device restrictions
    }
  }

  // Success / calculated chime
  playSuccess(enabled: boolean = true) {
    if (!enabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.06); // A5

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(now + 0.18);
    } catch {
      // Ignore
    }
  }

  // Vibrate / haptic pulse
  vibrate(enabled: boolean = true, durationMs: number = 10) {
    if (!enabled) return;
    try {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate(durationMs);
      }
    } catch {
      // Ignore
    }
  }

  // Combined tap feedback
  triggerTap(sound: boolean = true, haptics: boolean = true) {
    this.playTap(sound);
    this.vibrate(haptics, 10);
  }

  triggerSuccess(sound: boolean = true, haptics: boolean = true) {
    this.playSuccess(sound);
    this.vibrate(haptics, 25);
  }
}

export const feedback = new FeedbackService();
