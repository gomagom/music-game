// ゲームの初期化を行う
function gameInit() {
    CAN.width = CANVAS_W;
    CAN.height = CANVAS_H;
    CAN.setAttribute('style', 'display:block;margin:auto;background-color: #e6afcf');
    CTX.lineWidth = LINE_WIDTH;

    btn.start.addEventListener('click', () => {
        if ((element.uploadCSV.checked && !element.uploadCSVFile.files[0])
         || (element.uploadMusic.checked && !element.uploadMusicFile.files[0])) {
            alert('ファイルを選択してください');
            return;
        }
        gameStart();
        eventObserver();
        element.startOverlay.style.display = "none";
    });
}

// 必要なデータを準備し、ゲームループを開始
function gameStart() {
    gameScore = new GameScoreManager();
    for (let i = 0; i < 4; i++) {
        BACK_LANE[i] = new BackLane(i);
    }
    prepareMusicScore();
    prepareMusicFile();
    sound.seList.forEach(loadSE);
    time.start = Date.now();
    gameLoop();
}

// 実行用の譜面を準備
async function prepareMusicScore() {
    let score = null;

    // CSVから読み込んだ譜面データを受け取る
    if (element.uploadCSV.checked) {
        score = await importCSV();
    } else {
        score = await getCSV();
    }

    const LANE_DATA = cutMusicScore(score); // 譜面データをレーン毎のデータにする

    BACK_LANE.forEach((val, index) => val.generateNote(LANE_DATA[index]));
}

// ローカルのCSVファイルを読み込む
function importCSV() {
    return new Promise((resolve) => {
        const FILE = element.uploadCSVFile;
        const READER = new FileReader();
        READER.readAsText(FILE.files[0]);
        READER.addEventListener('load', () => {
            resolve(convertCSVtoArray(READER.result));
        });
    });
}

// sheet/のCSVファイルを読み込む
function getCSV() {
    return new Promise((resolve) => {
        const SELECT = document.getElementById('select-csv-file');
        const REQ = new XMLHttpRequest();           // HTTPでファイルを読み込むためのXMLHttpRrequestオブジェクトを生成
        REQ.open('get', 'sheet/' + SELECT.value + '.csv', true);  // アクセスするファイルを指定
        REQ.send(null);                             // HTTPリクエストの発行
        REQ.addEventListener('load', () => {
            resolve(convertCSVtoArray(REQ.responseText));    // 読み込んだ文字データを関数に渡して終了
        });
    });
}

// CSVで読み込んだ文字データを2次元配列に格納
function convertCSVtoArray(str) {
    const TMP = str.split('\r\n');                              // 改行位置で分割して格納
    info.title = TMP[0].split(',', 1)[0];                       // タイトル名を格納
    const RESULT = TMP.map(val => val.split(',').map(Number));  // ','の位置で分割して格納

    // 曲情報を格納
    info.bpm = RESULT[0][1];
    info.musicL = RESULT[0][2];
    info.musicStart = RESULT[0][3];

    return RESULT;
}

// 譜面データをレーン毎に切り分ける
function cutMusicScore(arr) {
    const DATA = new Array(4);

    arr.shift();                                        // 曲情報を含む先頭行を削除
    arr.sort((first, second) => first[3] - second[3]);  // 到達時間順に並べ替える
    time.end = arr[arr.length - 1][3] + 1500;

    // レーン番号を元に分ける
    for (let i = 0; i < DATA.length; i++) {
        DATA[i] = arr.filter((val, index) => arr[index][1] === i + 1);
    }

    return DATA;
}

// ゲーム用の音楽ファイルを準備
async function prepareMusicFile() {
    let src;
    if (element.uploadMusic.checked) {
        src = await importMusic();
    } else {
        src = await getMusic();
    }
    if (!sound.bgm) {
        sound.bgm = new Audio(src);
    }
    sound.bgm.volume = sound.bgmVolume;
    sound.bgm.currentTime = 0;
    sound.bgm.play();
}

// ローカルの楽曲ファイルを読み込む
function importMusic() {
    return new Promise((resolve) => {
        const SELECT = element.uploadMusicFile;
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

// SEを読み込む
function loadSE(soundKey) {
    const REQ = new XMLHttpRequest();
    REQ.responseType = 'arraybuffer';
    REQ.open('get', soundKey.url, true);
    REQ.addEventListener('load', () => {
        ACTX.decodeAudioData(
            REQ.response,
            function(data) {
                soundKey.data = data;
            },
            function(e) {
                alert(e.err);
            }
        );
    });
    REQ.send();
}
