'use strict';

const inputKey = {
  lane: ['d', 'f', 'j', 'k'],
  pause: 'p',
  status: []
};

const lane = {
  width: 250,
  margin: 100,
  color: [238, 238, 238],
  actColor: [228, 0, 127]
};

const note = {
  width: lane.width,      // ノーツの幅(px)
  height: 100,
  hitRange: [30, 60, 120, 240],   // 判定の範囲(±ms)
  frameColor: [0, 174, 239],
  bodyColor: [0, 174, 239, 0.8]
};

const time = {
  elapsed: 0,
  elapsedAll: 0,
  stopped: 0,
  stoppedTmp: 0,
  start: 0,
  end: 0
};

const btn = {
  start: document.getElementById('start-btn'),
  continue: document.getElementById('btn-continue'),
  restart: document.getElementsByClassName('btn-restart')
};

const element = {
  startOverlay: document.getElementById('startOverlay'),
  uploadCSV: document.getElementById('upload-csv'),
  uploadCSVFile: document.getElementById('upload-csv-file'),
  uploadMusic: document.getElementById('upload-music'),
  uploadMusicFile: document.getElementById('upload-music-file'),
  uploadStr: this.startOverlay.getElementsByTagName('p'),
  BGMSlider: document.getElementById('BGM-slider'),
  SESlider: document.getElementById('SE-slider')
};

const CAN = document.getElementById("can");
const CTX = CAN.getContext("2d");
const CANVAS_W = 2160;
const CANVAS_H = 2160;
const LINE_WIDTH = 10;
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const ACTX = new AudioContext();
const JUDGE_LINE = new JudgeLine();
const gameScore = new GameScoreManager();
const musicalScore = new musicalScoreManager();
const sound = new soundManager();
const BACK_LANE = [];
for (let i = 0; i < 4; i++) {
  BACK_LANE[i] = new BackLane(i);
}
let storage = null;
let gameActive = false;
let gameFinish = true;
let loopReq = null;

// リザルト画面を表示する
function showResult() {
  if (time.end > time.elapsed || !time.end) {
    return;
  }
  cancelAnimationFrame(loopReq);
  gameFinish = true;
  gameActive = false;

  gameScore.point = Math.floor(gameScore.point);
  const RESULT_INFO = document.getElementsByClassName('result-info');
  const LIST = ['point', 'perfect', 'great', 'good', 'bad', 'maxCombo'];
  const STR = ['Score', 'Perfect', 'Great', 'Good', 'Bad', 'MaxCombo'];
  LIST.forEach((val, index) => RESULT_INFO[index].textContent = `${STR[index]} : ${gameScore[LIST[index]]}`);

  document.getElementById('resultOverlay').style.display = "block";
}

window.addEventListener('load', () => {
  gameInit();
});
