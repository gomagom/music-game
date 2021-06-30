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
    hitRange: [40, 70, 120, 220],   // 判定の範囲(±ms)
    frameColor: [0, 174, 239],
    bodyColor: [0, 174, 239, 0.8]
};

const sound = {
    bgm: null,
    seList: [
        {url: 'sound/se_hit.mp3', data: null},
        {url: 'sound/se_bad.mp3', data: null},
    ],
    bgmVolume: 0.25,
    seVolume: 1,
    data: null
};

const info = {
    title: '',
    bpm: 0,
    musicL: 0,
    musicStart: 0
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
const BACK_LANE = [];
let gameScore = null;
const JUDGE_LINE = new JudgeLine();
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const ACTX = new AudioContext();
let storage = null;
let gameActive = true;
let gameFinish = false;

// リザルト画面を表示する
function showResult() {
    gameFinish = true;
    gameActive = false;

    gameScore.point = Math.floor(gameScore.point);
    const RESULT_INFO = document.getElementsByClassName('result-info');
    const LIST = ['point', 'perfect', 'great', 'good', 'bad', 'maxCombo'];
    const STR = ['Score', 'Perfect', 'Great', 'Good', 'Bad', 'MaxCombo'];
    LIST.forEach((val, index) => RESULT_INFO[index].textContent = `${STR[index]} : ${gameScore[LIST[index]]}`);

    document.getElementById('resultOverlay').style.display = "block";
}

// デバック用の情報を表示する
function showDebugInfo() {
    CTX.font = '100px Impact';
    CTX.fillStyle = 'black';
    CTX.fillText(gameScore.perfect, 20, 100);
    CTX.fillText(gameScore.great, 20, 220)
    CTX.fillText(gameScore.good, 20, 340);
    CTX.fillText(gameScore.bad, 20, 460);
    CTX.fillText(gameScore.combo, 20, 580);
    CTX.fillText(gameScore.maxCombo, 20, 700);
    CTX.fillText(time.elapsed, 1750, 100);
    CTX.fillText(time.stopped, 1750, 220)
}

// ゲームの起点となる
window.addEventListener('load', () => {
    element.uploadMusicFile.addEventListener('change', () => {
        element.uploadStr[1].textContent = element.uploadMusicFile.files[0].name;
    });
    element.uploadCSVFile.addEventListener('change', () => {
        element.uploadStr[3].textContent = element.uploadCSVFile.files[0].name;
    });
    try {
        storage = JSON.parse(localStorage['Music-Game'] || '{}');
        for (const key in storage) {
            if (key === 'lane') {
                inputKey[key] = storage[key];
            } else if (key === 'pause') {
                inputKey[key] = storage[key];
            } else {
                sound[key] = storage[key];
            }
        }
    } catch(e) {
        storage = {};
    }
    document.getElementById('info').textContent = `Pause : ${inputKey.pause.toUpperCase()}`;
    element.BGMSlider.value = sound.bgmVolume * 200;
    element.SESlider.value = sound.seVolume * 50;
    gameInit();
});
