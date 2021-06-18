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

function gameInit() {
    CAN.width = CANVAS_W;
    CAN.height = CANVAS_H;
    CAN.setAttribute('style', 'display:block;margin:auto;background-color: #e6afcf');
    CTX.lineWidth = LINE_WIDTH;

    BTN.start.onclick = () => {
        if ((ELEMENT.uploadCSV.checked && !ELEMENT.uploadCSVFile.files[0])
         || (ELEMENT.uploadMusic.checked && !ELEMENT.uploadMusicFile.files[0])) {
            alert('ファイルを選択してください');
            return;
        }
        gameStart();
        eventObserver();
        ELEMENT.startOverlay.style.display = "none";
    };
}

function gameLoop() {
    if (gameActive) {
        calcElapsedTime();
    } else {
        calcStoppedTime();
    }

    BACK_LANE.forEach(val => val.update());

    CTX.clearRect(0, 0, CANVAS_W, CANVAS_H);
    BACK_LANE.forEach(val => val.draw());
    JUDGE_LINE.draw();
    BACK_LANE.forEach(val => val.drawNote());
    drawCombo();

    // showDebugInfo();     // デバッグ用データ描画

    if (TIME.end > TIME.elapsed || !TIME.end) {
        window.requestAnimationFrame(gameLoop);
    } else {
        showResult();
    }
}

window.onload = () => {
    ELEMENT.uploadMusicFile.onchange = () => {
        ELEMENT.uploadStr[1].textContent = ELEMENT.uploadMusicFile.files[0].name;
        console.log(ELEMENT.uploadMusicFile.files[0].name);
    }
    ELEMENT.uploadCSVFile.onchange = () => {
        ELEMENT.uploadStr[3].textContent = ELEMENT.uploadCSVFile.files[0].name;
    }
    try {
        storage = JSON.parse(localStorage['Music-Game'] || '{}');
    } catch(e) {
        storage = {};
    }
    for (const key in storage) {
        if (key === 'lane') {
            KEY[key] = storage[key];
        } else if (key === 'pause') {
            KEY[key] = storage[key];
        } else {
            SOUND[key] = storage[key];
        }
    }
    document.getElementById('info').textContent = `Pause : ${KEY.pause.toUpperCase()}`;
    ELEMENT.BGMSlider.value = SOUND.bgmVolume * 200;
    ELEMENT.SESlider.value = SOUND.seVolume * 50;
    gameInit();
}
