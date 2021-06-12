function checkHit(hitTime, range) {
    if (Math.abs(TIME.elapsed - hitTime) <= range) {
        return true;
    } else {
        return false;
    }
}

// ゲーム内の経過時間と稼働時間を計算
function calcElapsedTime() {
    TIME.elapsedAll = Date.now() - TIME.start;
    TIME.elapsed = TIME.elapsedAll - TIME.stopped;
}

// 実行用の譜面を準備
async function prepareMusicScore() {
    const SCORE = await getCSV(); // CSVから読み込んだ譜面データを受け取る

    // 曲情報を格納
    INFO.title = SCORE[0][0];
    INFO.bpm = SCORE[0][1] - 0;
    INFO.musicL = SCORE[0][2] - 0;
    INFO.musicStart = SCORE[0][3] - 0;

    const LANE_DATA = cutMusicScore(SCORE); // 譜面データをレーン毎のデータにする

    BACK_LANE.forEach((val, index) => val.generateNote(LANE_DATA[index]));
}

// CSVファイルを読み込む
function getCSV() {
    return new Promise((resolve) => {
        const REQ = new XMLHttpRequest();           // HTTPでファイルを読み込むためのXMLHttpRrequestオブジェクトを生成
        REQ.open('get', 'sheet/sample.csv', true);  // アクセスするファイルを指定
        REQ.send(null);                             // HTTPリクエストの発行
        REQ.onload = () => resolve(convertCSVtoArray(REQ.responseText));    // 読み込んだ文字データを関数に渡して終了
    });
}

// CSVで読み込んだ文字データを2次元配列に格納
function convertCSVtoArray(str) {
    const RESULT = [];
    const TMP = str.split('\r\n');  // 改行位置で分割して格納
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

    // レーン番号を元に分ける
    for (let i = 0; i < DATA.length; i++) {
        DATA[i] = arr.filter((val, index) => {
            return arr[index][1] === i + 1 ;
        });
    }
    return DATA;
}
