window.TMAudio = {
  el: null,

  load(song) {
    this.el = document.getElementById("song");
    this.el.src = song.audio;
    this.el.volume = TMSettings.values.bgmVolume;
    this.el.load();
  },

  async play() {
    await this.el.play();
  },

  pause() {
    this.el.pause();
  },

  stop() {
    this.el.pause();
    this.el.currentTime = 0;
  },

  seek(t) {
    this.el.currentTime = t;
  },

  time() {
    return this.el?.currentTime || 0;
  },

  duration() {
    return this.el?.duration || 247.92;
  }
};

/* 登入首頁 BGM */
const loginBgm = document.getElementById("loginBgm");
const enterOverlay = document.getElementById("enterOverlay");
const enterGameButton = document.getElementById("enterGameButton");

if (loginBgm && enterOverlay && enterGameButton) {
  loginBgm.volume = 0.3;

  enterGameButton.addEventListener("click", async function () {
    try {
      await loginBgm.play();

      enterOverlay.classList.add("hide");

      setTimeout(function () {
        enterOverlay.style.display = "none";
      }, 400);
    } catch (error) {
      console.log("登入音樂播放失敗", error);
    }
  });
}


/* 遊戲按鍵與判定音效：使用 Web Audio 動態產生，不需要額外 MP3 */
window.TMSFX = {
  context: null,
  masterGain: null,

  ensureContext() {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return null;

    if (!this.context) {
      this.context = new AudioContextClass();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
    }

    if (this.context.state === "suspended") {
      this.context.resume().catch(() => {});
    }

    const volume =
      window.TMSettings && TMSettings.values
        ? Number(TMSettings.values.seVolume ?? 0.7)
        : 0.7;

    this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    return this.context;
  },

  tone({
    frequency = 520,
    duration = 0.055,
    type = "sine",
    gain = 0.12,
    slideTo = null
  } = {}) {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || gain <= 0) return;

    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);

    if (slideTo) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(20, slideTo),
        now + duration
      );
    }

    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(gain, now + 0.005);
    envelope.gain.exponentialRampToValueAtTime(
      0.0001,
      now + duration
    );

    oscillator.connect(envelope);
    envelope.connect(this.masterGain);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  },

  tap(lane = 0) {
    const notes = [430, 500, 570, 640];

    this.tone({
      frequency: notes[lane] || 520,
      duration: 0.045,
      type: "triangle",
      gain: 0.105,
      slideTo: (notes[lane] || 520) * 1.16
    });
  },

  judge(result) {
    const settings = {
      PERFECT: { frequency: 880, duration: 0.075, gain: 0.08 },
      GREAT: { frequency: 720, duration: 0.065, gain: 0.065 },
      GOOD: { frequency: 560, duration: 0.055, gain: 0.05 }
    };

    const item = settings[result];
    if (!item) return;

    this.tone({
      ...item,
      type: "sine",
      slideTo: item.frequency * 1.1
    });
  }
};
