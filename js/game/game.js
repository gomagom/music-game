'use strict';

const CAN = document.getElementById("can");
const CTX = CAN.getContext("2d");
const CANVAS_W = 2160;
const CANVAS_H = 2160;
const KEY = {
    lane: ['d', 'f', 'j', 'k'],
    pause: ['Escape', 'p']
};

const LANE = {
    width: 250,
    margin: 100,
    color: '#eee'
};

const NOTE = {
    width: LANE.width,      // ノーツの幅(px)
    height: 100,
    perfectTime: 40,        // 判定の範囲(±ms)
    greatTime: 70,
    goodTime: 120,
    badTime: 220,
    color: '#00aeef'
};

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
    start: 0
};

const BACK_LANE = [];
const JUDGE_LINE = new JudgeLine;
let gameFrame = 0;

function gameInit() {
    CAN.width = CANVAS_W;
    CAN.height = CANVAS_H;
    CAN.setAttribute('style', 'display:block;margin:auto;background-color: #bbb');
    CTX.font = "100px 'Impact";

    for (let i = 0; i < 4; i++) {
        BACK_LANE[i] = new BackLane(i);
    }

    TIME.start = Date.now();
    prepareMusicScore();
}

function gameLoop() {
    gameFrame++;
    calcElapsedTime();

    CTX.clearRect(0, 0, CANVAS_W, CANVAS_H);
    CTX.font = "100px 'Impact";
    CTX.fillStyle = 'black';
    CTX.fillText(TIME.elapsed, 20, 100);

    BACK_LANE.forEach(val => val.draw());
    JUDGE_LINE.draw();
    BACK_LANE.forEach(val => val.drawNote());
    window.requestAnimationFrame(gameLoop);
}

window.onload = () => {
    gameInit();
    gameLoop();
}
