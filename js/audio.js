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
