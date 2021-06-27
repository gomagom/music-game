'use strict';

const KEY = {
    lane: ['d', 'f', 'j', 'k'],
    pause: 'p',
    status: []
};

const LANE = {
    width: 250,
    margin: 100,
    color: [238, 238, 238],
    actColor: [228, 0, 127]
};

const NOTE = {
    width: LANE.width,      // ノーツの幅(px)
    height: 100,
    hitRange: [40, 70, 120, 220],   // 判定の範囲(±ms)
    frameColor: [0, 174, 239],
    bodyColor: [0, 174, 239, 0.8]
};

const SOUND = {
    bgm: null,
    seList: [
        {url: 'sound/se_hit.mp3', data: null},
        {url: 'sound/se_bad.mp3', data: null},
    ],
    bgmVolume: 0.25,
    seVolume: 1,
    data: null
}

const SCORE = {
    point: 0,
    combo: 0,
    maxCombo: 0,
    perfect: 0,
    great: 0,
    good: 0,
    bad: 0
};

const INFO = {
    title: '',
    bpm: 0,
    musicL: 0,
    musicStart: 0
};

const TIME = {
    elapsed: 0,
    elapsedAll: 0,
    stopped: 0,
    stoppedTmp: 0,
    start: 0,
    end: 0
};

const BTN = {
    start: document.getElementById('start-btn'),
    continue: document.getElementById('btn-continue'),
    restart: document.getElementsByClassName('btn-restart')
}

const ELEMENT = {
    startOverlay: document.getElementById('startOverlay'),
    uploadCSV: document.getElementById('upload-csv'),
    uploadCSVFile: document.getElementById('upload-csv-file'),
    uploadMusic: document.getElementById('upload-music'),
    uploadMusicFile: document.getElementById('upload-music-file'),
    uploadStr: this.startOverlay.getElementsByTagName('p'),
    BGMSlider: document.getElementById('BGM-slider'),
    SESlider: document.getElementById('SE-slider')
}

const CAN = document.getElementById("can");
const CTX = CAN.getContext("2d");
const CANVAS_W = 2160;
const CANVAS_H = 2160;
const LINE_WIDTH = 10;
const BACK_LANE = [];
const JUDGE_LINE = new JudgeLine;
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const ACTX = new AudioContext();
let storage = null;
let gameActive = true;
let gameFinish = false;

window.addEventListener('load', () => {
    ELEMENT.uploadMusicFile.addEventListener('change', () => {
        ELEMENT.uploadStr[1].textContent = ELEMENT.uploadMusicFile.files[0].name;
    });
    ELEMENT.uploadCSVFile.addEventListener('change', () => {
        ELEMENT.uploadStr[3].textContent = ELEMENT.uploadCSVFile.files[0].name;
    });
    try {
        storage = JSON.parse(localStorage['Music-Game'] || '{}');
        for (const key in storage) {
            if (key === 'lane') {
                KEY[key] = storage[key];
            } else if (key === 'pause') {
                KEY[key] = storage[key];
            } else {
                SOUND[key] = storage[key];
            }
        }
    } catch(e) {
        storage = {};
    }
    document.getElementById('info').textContent = `Pause : ${KEY.pause.toUpperCase()}`;
    ELEMENT.BGMSlider.value = SOUND.bgmVolume * 200;
    ELEMENT.SESlider.value = SOUND.seVolume * 50;
    gameInit();
});

function showResult() {
    gameFinish = true;
    gameActive = false;

    SCORE.point = Math.floor(SCORE.point);
    const INFO = document.getElementsByClassName('result-info');
    const LIST = ['point', 'perfect', 'great', 'good', 'bad', 'maxCombo'];
    const STR = ['Score', 'Perfect', 'Great', 'Good', 'Bad', 'MaxCombo'];
    LIST.forEach((val, index) => INFO[index].textContent = `${STR[index]} : ${SCORE[LIST[index]]}`);

    document.getElementById('resultOverlay').style.display = "block";
}

// デバック用の情報を表示する
function showDebugInfo() {
    CTX.font = '100px Impact';
    CTX.fillStyle = 'black';
    CTX.fillText(SCORE.perfect, 20, 100);
    CTX.fillText(SCORE.great, 20, 220)
    CTX.fillText(SCORE.good, 20, 340);
    CTX.fillText(SCORE.bad, 20, 460);
    CTX.fillText(SCORE.combo, 20, 580);
    CTX.fillText(SCORE.maxCombo, 20, 700);
    CTX.fillText(TIME.elapsed, 1750, 100);
    CTX.fillText(TIME.stopped, 1750, 220)
}
