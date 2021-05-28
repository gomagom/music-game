//デバッグのフラグ
const DEBUG = true;

let score = 0;
let combo = 0;
let maxCombo = 0;
let perfect = 0;
let great = 0;
let good = 0;
let bad = 0;

//メニューのボタン要素
let MENU = document.getElementById('menu');
let BTN_BACK = document.getElementById('btn-back');

//キャンバスサイズ
const CANVAS_W = 600;
const CANVAS_H = 600;

//ノーツのサイズ
const NOTE_W = 50;
const NOTE_H = 16;

//ノーツの位置
const NOTE_SET = [225, 275, 325, 375];

//ノーツのキー
const NOTE_KEY = ['d', 'f', 'j', 'k'];

//ノーツの判定フレーム
const PERFECT_HIT = 2;
const GREAT_HIT = 4;
const GOOD_HIT = 6;
const BAD_HIT = 8;

//ロングノーツのコンボ間隔(フレーム)
const COMBO_FLAME = 20;

//レーンの線の位置
const LANE_SET = [NOTE_SET[0] - NOTE_W / 2, NOTE_SET[1] - NOTE_W / 2, NOTE_SET[2] - NOTE_W / 2, NOTE_SET[3] - NOTE_W / 2, NOTE_SET[3] - NOTE_W / 2 + NOTE_W];

//経過時間
let elapsedTime = 0;
let startTime = 0;
let stoppedTime = 0;

//1フレームあたりの時間(ms)
const FLAME_TIME = 1000 / 60;

//現在そのレーンに判定処理を行っているノーツがあるかどうか
let isHit = [false, false, false, false];

// BGM
let BGM1 = document.getElementById("bgm1");
let SE_HIT = document.getElementById("se_hit");
let SE_BAD = document.getElementById("se_bad");

//ゲームの状態
let gameStatus = 0; //0か3で動く。1,2はとまる。
let windowStatus = true;
let btnBack = false;

//ゲーム一時停止キー
const PAUSE_KEY = 'Escape';

//キャンバス
let can = document.getElementById("can");
let ctx = can.getContext("2d");
can.width = CANVAS_W;
can.height = CANVAS_H;
can.setAttribute('style', 'display:block;margin:auto;background-color: #ddd');

//ノーツの実体
let note = [];

function getCSV() {
    var req = new XMLHttpRequest(); // HTTPでファイルを読み込むためのXMLHttpRrequestオブジェクトを生成
    req.open("get", "sheet/sample1.csv", true); // アクセスするファイルを指定
    req.send(null); // HTTPリクエストの発行

    // レスポンスが返ってきたらconvertCSVtoArray()を呼ぶ	
    req.onload = function () {
        convertCSVtoArray(req.responseText); // 渡されるのは読み込んだCSVデータ
    }

}

function convertCSVtoArray(str) { // 読み込んだCSVデータが文字列として渡される
    var result = []; // 最終的な二次元配列を入れるための配列
    var tmp = str.split("\n");

    for (let i = 0; i < tmp.length; i++) {
        result[i] = tmp[i].split(',');
    }

    for (let i = 1; i < tmp.length; i++) {
        var noteType = result[i][0] - 0;
        var noteLane = result[i][1] - 0;
        var noteSpeed = result[i][2] - 0;
        var noteTime = result[i][3] - 0;
        var noteOption = result[i][4] - 0;

        switch (noteType) {
            case 1:
                note[i - 1] = new Note(noteLane, noteSpeed, noteTime);
                break;
            case 2:
                note[i - 1] = new LongNote(noteLane, noteSpeed, noteTime, noteOption);
                break;
        }
    }

    gameInit();
}

// 判定ラインの実体
let border = new Border();

//レーンの線の実体
let backLane = [];

function setLane() {
    for (let i = 0; i < 5; i++) {
        backLane[i] = new BackLane(i);
    }
}

//それぞれのキーの状態を保存する配列
let key = [];

//キーが押されたときと押し続けているとき
document.onkeydown = function(e) {
    key[e.key] = true;
}

//キーが離された時
document.onkeyup = function(e) {
    key[e.key] = false;
}

//戻るボタンの動作
BTN_BACK.addEventListener('click', () => {
    btnBack = true;
});

//ゲームの初期化
function gameInit() {
    for (let i = 0; i < note.length; i++) {
        note[i].prepare();
    }

    startTime = Date.now();
    BGM1.volume = 0.2;
    SE_HIT.volume = 1;
    SE_BAD.volume = 0.5;
    BGM1.play();
    setInterval(gameCheck, FLAME_TIME);
    gameLoop();
}

//あたり判定
function checkHit(noteY, noteHit, borderY) {
    let r = borderY - noteY;

    return r * r <= noteHit * noteHit;
}

//デバッグ表示
function putInfo() {
    if (DEBUG) {
        ctx.font = "20px 'Impact";
        ctx.fillStyle = "black";
        ctx.fillText("Score:" +score, 20, 20);
        ctx.fillText("Combo:" +combo, 20, 40);
        ctx.fillText("Max Combo:" +maxCombo, 20, 60)
        ctx.fillText("Perfect:" +perfect, 20, 80);
        ctx.fillText("Great:" +great, 20, 100);
        ctx.fillText("Good:" +good, 20, 120);
        ctx.fillText("Bad:" +bad, 20, 140);
    }
}

//チェックループ
function gameCheck() {
    windowStatus = document.hasFocus();

    if (!windowStatus && gameStatus != 2) {
        gameStatus = 2;
        BGM1.pause();
        MENU.classList.add('open');
    }
}

//ゲームが動いている時の処理
function gameActive() {
    ctx.clearRect(0, 0, can.width, can.height);

    elapsedTime = Date.now() - startTime - stoppedTime;

    for (let i = 0; i < note.length; i++) {
        note[i].update();
    }

    border.draw();

    for (let i = 0; i < note.length; i++) {
        note[i].draw();
    }
 
    for (let i = 0; i < backLane.length; i++) {
        backLane[i].draw();
    }

    if (combo > maxCombo) {
        maxCombo = combo;
    }

    putInfo();
}

//ゲームをポーズした時の処理
function gamePause() {
    stoppedTime = Date.now() - startTime - elapsedTime;
}

//ゲームループ
function gameLoop() {
    if (key[PAUSE_KEY] && gameStatus == 0) {
        gameStatus++;
        BGM1.pause();
        MENU.classList.add('open');
    }
    if (!key[PAUSE_KEY] && gameStatus == 1) {
        gameStatus++;
    }
    if (key[PAUSE_KEY] && gameStatus == 2 || btnBack) {
        gameStatus++;
        BGM1.currentTime = elapsedTime / 1000;
        BGM1.play();
        MENU.classList.remove('open');
    }
    if ((!key[PAUSE_KEY] || btnBack) && gameStatus == 3) {
        gameStatus = 0;
        btnBack = false;
    }

    if (gameStatus == 0 || gameStatus == 3) {
        gameActive();
    } else {
        gamePause();
    }

    window.requestAnimationFrame(gameLoop);
}

//オンロードでゲーム開始
window.onload = function() {
    setLane();
	getCSV();
}
