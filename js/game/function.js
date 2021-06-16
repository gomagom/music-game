function gameStart() {
    for (let i = 0; i < 4; i++) {
        BACK_LANE[i] = new BackLane(i);
    }
    prepareMusicScore();
    prepareMusicFile();
    SOUND.seList.forEach(loadSE);
    TIME.start = Date.now();
    gameLoop();
}

// ゲーム内の経過時間と稼働時間を計算
function calcElapsedTime() {
    TIME.elapsedAll = Date.now() - TIME.start;
    TIME.elapsed = TIME.elapsedAll - TIME.stopped;
}

// 実行用の譜面を準備
async function prepareMusicScore() {
    let score
    if (ELEMENT.uploadCSV.checked) {
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
        const FILE = ELEMENT.uploadCSVFile;
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
    TIME.end = arr[arr.length - 1][3] + 3000;

    // レーン番号を元に分ける
    for (let i = 0; i < DATA.length; i++) {
        DATA[i] = arr.filter((val, index) => arr[index][1] === i + 1);
    }

    return DATA;
}

// ゲーム用の音楽ファイルを準備
async function prepareMusicFile() {
    let src;
    if (ELEMENT.uploadMusic.checked) {
        src = await importMusic();
    } else {
        src = await getMusic();
    }
    if (!SOUND.bgm) {
        SOUND.bgm = new Audio(src);
    }
    SOUND.bgm.volume = SOUND.bgmVolume;
    SOUND.bgm.currentTime = 0;
    SOUND.bgm.play();
}


// ローカルの楽曲ファイルを読み込む
function importMusic() {
    return new Promise((resolve) => {
        const SELECT = ELEMENT.uploadMusicFile;
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


// ヒットSEを読み込む
function loadSE(sound) {
    const REQ = new XMLHttpRequest();
    REQ.responseType = 'arraybuffer';
    REQ.open('get', sound.url, true);
    REQ.onload = () => {
        SCTX.decodeAudioData(
            REQ.response,
            function(data) {
                sound.data = data;
            },
            function(e) {
                alert(e.err);
            }
        );
    };
    REQ.send();
}


//　ヒットSEを鳴らす
function playSE(sound) {
    if (!sound.data) {
        return;
    }
    const BUFFER_SOURCE = SCTX.createBufferSource();
    BUFFER_SOURCE.buffer = sound.data;
    BUFFER_SOURCE.connect(SCTX.destination);
    BUFFER_SOURCE.start(0);
}

function eventObserver() {
    //キーが押されたときと押し続けているとき
    document.onkeydown = e => {
        const TARGET = BACK_LANE.find(val => val.key === e.key);
        if (TARGET && !KEY.status[TARGET.key] && gameActive) {
            TARGET.judge();
        }
        if (KEY.pause === e.key && !KEY.status[e.key] && !gameFinish) {
            toggleGame();
        }
        KEY.status[e.key] = true;
    };

    document.onkeyup = e => KEY.status[e.key] = false;  //キーが離された時

    BTN.continue.addEventListener('click', () => toggleGame());
    BTN.restart[0].addEventListener('click', () => gameRestart());
    BTN.restart[1].addEventListener('click', () => gameRestart());

    window.addEventListener('blur', () => {
        if (gameActive && !gameFinish) {
            toggleGame();
        }
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
    gameFinish = false;
    toggleGame();
    gameStart();
    document.getElementById('resultOverlay').style.display = "none";
}

function calcStoppedTime() {
    TIME.stopped = Date.now() - TIME.start - TIME.elapsed;
}

function updateGameScore(grade) {
    switch (grade) {
        case 0:
            SCORE.point += 100 + SCORE.combo;
            SCORE.perfect++;
            SCORE.combo++;
            break;
        case 1:
            SCORE.point += 80 + SCORE.combo * 0.8;
            SCORE.great++;
            SCORE.combo++;
            break;
        case 2:
            SCORE.point += 50 + SCORE.combo * 0.5;
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

function drawCombo() {
    if (SCORE.combo < 2) {
        return;
    }
    CTX.save();
    CTX.beginPath();
    CTX.font = '300px Arial Black';
    CTX.textAlign = 'center';
    CTX.textBaseline = 'middle';
    CTX.fillStyle = 'rgba(255, 204, 0, 0.9)';
    CTX.fillText(SCORE.combo, CANVAS_W / 2, CANVAS_H / 2);
    CTX.restore();
}

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
