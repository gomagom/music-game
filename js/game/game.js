'use strict';

const CAN = document.getElementById("can");
const CTX = CAN.getContext("2d");
const CANVAS_W = 2160;
const CANVAS_H = 2160;
const LINE_WIDTH = 10;
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
    bgm: 0,
    hit: document.getElementById('se-hit'),
    bad: document.getElementById('se-bad'),
    bgmVolume: 0.5,
    hitVolume: 0.5,
    badVolume: 0.5,
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
    start: 0
};

const BTN = {
    start: document.getElementById('start-btn'),
    continue: document.getElementById('btn-continue'),
    restart: document.getElementById('btn-restart')
}

const DEBUG = {

};

const BACK_LANE = [];
const JUDGE_LINE = new JudgeLine;
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const SCTX = new AudioContext();
let gameActive = true;
let gameFrame = 0;
let checkFrame = 0;

function gameInit() {
    CAN.width = CANVAS_W;
    CAN.height = CANVAS_H;
    CAN.setAttribute('style', 'display:block;margin:auto;background-color: #bbb');
    CTX.lineWidth = LINE_WIDTH;

    BTN.start.onclick = () => {
        gameStart();
        eventObserver();
        document.getElementById('startOverlay').style.display = "none";
    };
}

function checkLoop() {
    checkFrame++;
}

function gameLoop() {
    gameFrame++;
    if (!document.hasFocus() && gameActive) {
        toggleGame();
    }
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
    showDebugInfo();

    window.requestAnimationFrame(gameLoop);
}

window.onload = () => {
    gameInit();
}
