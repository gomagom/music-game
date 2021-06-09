'use strict';

const CAN = document.getElementById("can");
const CTX = CAN.getContext("2d");
const CANVAS_W = 2160;
const CANVAS_H = 2160;
const KEY = ['d', 'f', 'j', 'k'];
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
    color: '#008000'
};
const JUDGMENTLINE = {
    

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
let backLane = [];
let gameFrame = 0;

function gameInit() {
    CAN.width = CANVAS_W;
    CAN.height = CANVAS_H;
    CAN.setAttribute('style', 'display:block;margin:auto;background-color: #bbb');
    CTX.font = "100px 'Impact";
    for (let i = 0; i < 4; i++) {
        backLane[i] = new BackLane(i);
    }
}

function gameLoop() {
    gameFrame++;
    CTX.clearRect(0, 0, CAN.width, CAN.height);
    backLane.forEach(val => {
        val.draw();
    });
    window.requestAnimationFrame(gameLoop);
}

window.onload = () => {
    gameInit();
    gameLoop();
}
