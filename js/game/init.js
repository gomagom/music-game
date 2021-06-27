// ゲームの初期化を行う
function gameInit() {
    CAN.width = CANVAS_W;
    CAN.height = CANVAS_H;
    CAN.setAttribute('style', 'display:block;margin:auto;background-color: #e6afcf');
    CTX.lineWidth = LINE_WIDTH;

    BTN.start.addEventListener('click', () => {
        if ((ELEMENT.uploadCSV.checked && !ELEMENT.uploadCSVFile.files[0])
         || (ELEMENT.uploadMusic.checked && !ELEMENT.uploadMusicFile.files[0])) {
            alert('ファイルを選択してください');
            return;
        }
        gameStart();
        eventObserver();
        ELEMENT.startOverlay.style.display = "none";
    });
}

// 必要なデータを準備し、ゲームループを開始
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
    TIME.end = arr[arr.length - 1][3] + 1500;

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

// SEを読み込む
function loadSE(sound) {
    const REQ = new XMLHttpRequest();
    REQ.responseType = 'arraybuffer';
    REQ.open('get', sound.url, true);
    REQ.addEventListener('load', () => {
        ACTX.decodeAudioData(
            REQ.response,
            function(data) {
                sound.data = data;
            },
            function(e) {
                alert(e.err);
            }
        );
    });
    REQ.send();
}
