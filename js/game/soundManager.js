class soundManager {
  constructor() {
    this.bgm = null;
    this.seList = [
      { url: 'sound/se_hit.mp3', data: null },
      { url: 'sound/se_bad.mp3', data: null },
    ];
    this.bgmVolume = 0.25;
    this.seVolume = 1;
  }

  // ゲーム用の音楽ファイルを準備
  async prepareFile() {
    let src;
    if (element.uploadMusic.checked) {
      src = await this.importMusic();
    } else {
      src = await this.getMusic();
    }

    this.bgm = new Audio(src);
    this.bgm.volume = this.bgmVolume;

    this.seList.forEach(this.loadSE);

    return 1;
  }

  // ローカルの楽曲ファイルを読み込む
  importMusic() {
    return new Promise((resolve) => {
      const SELECT = element.uploadMusicFile;
      const SRC = window.URL.createObjectURL(SELECT.files[0]);
      resolve(SRC);
    });
  }

  // sound/の楽曲ファイルを読み込む
  getMusic() {
    return new Promise((resolve) => {
      const SELECT = document.getElementById('select-music-file');
      const SRC = 'sound/' + SELECT.value;
      resolve(SRC);
    });
  }

  // SEを読み込む
  loadSE(soundKey) {
    const REQ = new XMLHttpRequest();
    REQ.responseType = 'arraybuffer';
    REQ.open('get', soundKey.url, true);
    REQ.addEventListener('load', () => {
      ACTX.decodeAudioData(
        REQ.response,
        function (data) {
          soundKey.data = data;
        },
        function (e) {
          alert(e.err);
        }
      );
    });
    REQ.send();
  }

  // SEを鳴らす
  playSE(soundKey) {
    const BUFFER_SOURCE = ACTX.createBufferSource();
    const GAIN = ACTX.createGain();
    GAIN.gain.value = sound.seVolume;
    BUFFER_SOURCE.buffer = soundKey.data;
    BUFFER_SOURCE.connect(GAIN);
    GAIN.connect(ACTX.destination);
    BUFFER_SOURCE.start(0);
  }
}
