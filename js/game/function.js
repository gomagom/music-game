function gameStart() {
    for (let i = 0; i < 4; i++) {
        BACK_LANE[i] = new BackLane(i);
    }
    prepareMusicScore();
    prepareMusicFile();
    loadSE();
    TIME.start = Date.now();
    window.requestAnimationFrame(gameLoop);
    setInterval(checkLoop, 4);
}

// ゲーム内の経過時間と稼働時間を計算
function calcElapsedTime() {
    TIME.elapsedAll = Date.now() - TIME.start;
    TIME.elapsed = TIME.elapsedAll - TIME.stopped;
}

// 実行用の譜面を準備
async function prepareMusicScore() {
    let score
    if (document.getElementById('upload-csv').checked) {
        score = await importCSV();
    } else {
        score = await getCSV(); // CSVから読み込んだ譜面データを受け取る
    }

    // 曲情報を格納
    INFO.title = score[0][0];
    INFO.bpm = score[0][1] - 0;
    INFO.musicL = score[0][2] - 0;
    INFO.musicStart = score[0][3] - 0;

    const LANE_DATA = cutMusicScore(score); // 譜面データをレーン毎のデータにする

    BACK_LANE.forEach((val, index) => val.generateNote(LANE_DATA[index]));
}

// ローカルのCSVファイルを読み込む
function importCSV() {
    return new Promise((resolve) => {
        const FILE = document.getElementById('upload-csv-file');
        const READER = new FileReader();
        READER.readAsText(FILE.files[0]);
        READER.onload = () => resolve(convertCSVtoArray(READER.result));
    });
}

// sheet/のCSVファイルを読み込む
function getCSV() {
    return new Promise((resolve) => {
        const SELECT = document.getElementById('select-csv-file');
        const REQ = new XMLHttpRequest();           // HTTPでファイルを読み込むためのXMLHttpRrequestオブジェクトを生成
        REQ.open('get', 'sheet/' + SELECT.value + '.csv', true);  // アクセスするファイルを指定
        REQ.send(null);                             // HTTPリクエストの発行
        REQ.onload = () => resolve(convertCSVtoArray(REQ.responseText));    // 読み込んだ文字データを関数に渡して終了
    });
}

// CSVで読み込んだ文字データを2次元配列に格納
function convertCSVtoArray(str) {
    const RESULT = [];
    const TMP = str.split('\r\n');                                  // 改行位置で分割して格納
    TMP.forEach((val, index) => RESULT[index] = val.split(','));    // ','の位置で分割して格納

    // 2行目以降の文字列を数値に変換
    for (let i = 1; i < RESULT.length; i++) {
        for (let j = 0; j < RESULT[i].length; j++) {
            RESULT[i][j] = Number(RESULT[i][j]);
        }
    }
    return RESULT;
}

// 譜面データをレーン毎に切り分ける
function cutMusicScore(arr) {
    const DATA = new Array(4);

    arr.shift();                                        // 曲情報を含む先頭行を削除
    arr.sort((first, second) => first[3] - second[3]);  // 到達時間順に並べ替える

    // レーン番号を元に分ける
    for (let i = 0; i < DATA.length; i++) {
        DATA[i] = arr.filter((val, index) => arr[index][1] === i + 1);
    }

    return DATA;
}

// ゲーム用の音楽ファイルを準備
async function prepareMusicFile() {
    let src;
    if (document.getElementById('upload-music').checked) {
        src = await importMusic();
    } else {
        src = await getMusic();
    }
    if (!SOUND.bgm) {
        SOUND.bgm = new Audio(src);
    }
    SOUND.bgm.volume = SOUND.bgmVolume;
    SOUND.bgm.currentTime = 0;
    SOUND.hit.volume = SOUND.hitVolume;
    SOUND.bad.volume = SOUND.badVolume;
    SOUND.bgm.play();
}


// ローカルの楽曲ファイルを読み込む
function importMusic() {
    return new Promise((resolve) => {
        const SELECT = document.getElementById('upload-music-file');
        const SRC = window.URL.createObjectURL(SELECT.files[0]);
        resolve(SRC);
    });
}


// sound/の楽曲ファイルを読み込む
function getMusic() {
    return new Promise((resolve) => {
        const SELECT = document.getElementById('select-music-file');
        const SRC = 'sound/' + SELECT.value;
        resolve(SRC);
    });
}

function loadSE() {
    const REQ = new XMLHttpRequest();
    REQ.responseType = 'arraybuffer';
    REQ.open('get', 'sound/se_hit.mp3', true);
    REQ.onload = () => {
        SCTX.decodeAudioData(
            REQ.response,
            function(data) {
                SOUND.data = data;
            },
            function(e) {
                alert(e.err);
            }
        );
    };
    REQ.send();
}

function playSE() {
    if (!SOUND.data) {
        return;
    }
    const BUFFER_SOURCE = SCTX.createBufferSource();
    BUFFER_SOURCE.buffer = SOUND.data;
    BUFFER_SOURCE.connect(SCTX.destination);
    BUFFER_SOURCE.start(0);
}

function eventObserver() {
    //キーが押されたときと押し続けているとき
    document.onkeydown = e => {
        playSE();
        const TARGET = BACK_LANE.find(val => val.key === e.key);
        if (TARGET && !KEY.status[TARGET.key] && gameActive) {
            TARGET.judge();
        }
        if (KEY.pause === e.key && !KEY.status[e.key]) {
            toggleGame();
        }
        KEY.status[e.key] = true;
    };

    document.onkeyup = e => KEY.status[e.key] = false;  //キーが離された時

    BTN.continue.addEventListener('click', () => toggleGame());
    BTN.restart.addEventListener('click', () => {
        gameRestart();
        toggleGame();
    });
}

function toggleGame() {
    if (gameActive) {
        gameActive = false;
        SOUND.bgm.pause();
        document.getElementById('pauseOverlay').style.display = "block";
    } else {
        gameActive = true;
        SOUND.bgm.currentTime = TIME.elapsed / 1000;
        SOUND.bgm.play();
        document.getElementById('pauseOverlay').style.display = "none";
    }
}

function gameRestart() {
    for (const key in SCORE) {
        SCORE[key] = 0;
    }
    for (const key in TIME) {
        TIME[key] = 0;
    }
    gameStart();
}

function calcStoppedTime() {
    TIME.stopped = Date.now() - TIME.start - TIME.elapsed;
}

function updateGameScore(grade) {
    switch (grade) {
        case 0:
            SCORE.perfect++;
            SCORE.combo++;
            break;
        case 1:
            SCORE.great++;
            SCORE.combo++;
            break;
        case 2:
            SCORE.good++;
            SCORE.combo++;
            break;
        case 3:
            SCORE.bad++;
            SCORE.combo = 0;
            break;
    }

    if (SCORE.maxCombo < SCORE.combo) {
        SCORE.maxCombo = SCORE.combo;
    }
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

function testKansu() {

}

