class SoundService {
  private notificationAudio: HTMLAudioElement | null = null;
  private sentAudio: HTMLAudioElement | null = null;
  private isMuted = false;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        this.notificationAudio = new Audio("/sounds/notification.ogg");
        this.sentAudio = new Audio("/sounds/pop.ogg");
      } catch {
        // Audio might fail in non-browser environments
      }
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public playNotification() {
    if (this.isMuted) return;
    try {
      if (this.notificationAudio) {
        this.notificationAudio.currentTime = 0;
        this.notificationAudio.play().catch(() => {
          this.playBeepFallback(800, 0.1);
        });
      } else {
        this.playBeepFallback(800, 0.1);
      }
    } catch {
      // Ignored
    }
  }

  public playSent() {
    if (this.isMuted) return;
    try {
      if (this.sentAudio) {
        this.sentAudio.currentTime = 0;
        this.sentAudio.play().catch(() => {
          this.playBeepFallback(1200, 0.05);
        });
      } else {
        this.playBeepFallback(1200, 0.05);
      }
    } catch {
      // Ignored
    }
  }

  private playBeepFallback(freq: number, duration: number) {
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context may be restricted
    }
  }
}

export const sounds = new SoundService();

