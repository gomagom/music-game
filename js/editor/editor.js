//キャンバスサイズ
let canvasW;
let canvasH;

//レーンの線の位置
let laneSet;

//4部音符線同士のマージン
let qLineMargin = 80;

//分割モード
let divValue = 4; //4部音符から32部音符、3連符と6連符に対応

//ノーツの大きさ
let noteW;
let noteH;

//線の太さ
const LANE_T = 10;
const Q_LINE_T = 4;
const LINE_T = 2;

//マウス座標
let mouseDownX;
let mouseDownY;


//キャンバス
const can = document.getElementById("can2");
const ctx = can.getContext("2d");
can.setAttribute('style', 'background-color: #f6f7d7');

//レーンの線の実体
const editLane = Array(5).fill().map((_, idx) => new EditLane(idx))

//4部音符線の実体
const quarterLine = [];
let qLineQty; //4部音符線の数

function numberQLine(bpm, musicL) {
    return new Promise(function(resolve) {
        qLineQty = Math.floor(musicL / (60 / bpm) + 1);
        resolve();
    })
}

function setCanvas() {
    return new Promise(function(resolve) {
        canvasH = qLineQty * qLineMargin;
        can.height = canvasH;
        ctx.translate(0, can.height);
        ctx.scale(1, -1);
        can.style.height = canvasH * 2.5 +'px';
        resolve();
    })
}

function setQLine() {
    return new Promise(function(resolve) {
        for (let i = quarterLine.length; i < qLineQty; i++) {
            quarterLine[i] = new QuarterLine(i);
        }
        resolve();
    })
}

//4~32分音符の実体
let xLine = [];

for (let i = 0; i < 4; i++) {
    xLine[i] = [];
}

function setXLine() {
    return new Promise(function(resolve) {
        for (let i = 0; i < 4; i++) {
            for (let j = xLine[i].length; j < qLineQty; j++) {
                xLine[i][j] = [];
                for (let k = 0; k < 14; k++) {
                    xLine[i][j][k] = new XthLine(i, j, k);
                }
            }
        }
        resolve();
    })
}

//マウス押下検知
let mouseDown;
can.addEventListener('mousedown', async function(e) {
    mouseDown = true;
    await pos(e);
    await update();
    await draw();
});

can.addEventListener('mouseup', function(e) {
    mouseDown = false;
});

function pos(e) {
    return new Promise(function(resolve) {
        mouseDownX = (e.clientX - can.getBoundingClientRect().left);
        mouseDownY = -(e.clientY - can.getBoundingClientRect().bottom) / 2.5;
        console.log(mouseDownY);
        resolve();
    })
}

//適用ボタン検知
const infoSubmit = document.getElementById('submit');
infoSubmit.addEventListener('click', apply);

//適用処理
async function apply() {
    const {bpm, musicL} = getMusicInfoViaElement()

    await numberQLine(bpm, musicL);
    await setCanvas();
    await setQLine();
    await setXLine();
    await update();
    await draw();
    return Promise.resolve();
}

//クオンタイズセレクトボックス
const quantizeSelect = document.getElementById('quantize');

quantizeSelect.onchange = async function() {
    divValue = this.value;
    await update();
    await draw();
}

//縮尺変更
const canScale = document.getElementById('canScale');
canScale.onchange = async function() {
    qLineMargin = this.value;
    await setCanvas();
    await update();
    await draw();
    await scrollBottom();
}

//横幅のpxを取得
function getWidth() {
    return new Promise(function(resolve) {
        const cst = window.getComputedStyle(can);
        canvasW = parseInt(cst.width);
        can.width = canvasW;
        console.log(canvasW);
        resolve();
    })
}

//画面幅が変わった時に実行
window.onresize = async function() {
    await getWidth();
    await setCanvas();
    await update();
    await draw();
}

//一番下までスクロール
function scrollBottom() {
    return new Promise(function(resolve) {
        let target = document.getElementById('scroll');
        target.scrollTop = target.scrollHeight;
        resolve();
    })
}


//当たり判定
function checkHit(lane, y, set, margin) {
    if (laneSet[lane] < mouseDownX && mouseDownX < laneSet[lane + 1] && 
        y - margin < mouseDownY && mouseDownY < y + margin && set && mouseDown) {
        return true;
    }
}

//出力用のデータに変換
// 用途がよくわからないので関数名は適当です
function calcNote(jnoteValue, calced, musicBody) {
    return Math.round((jnoteValue + calced + musicBody * 1000) * 100) / 100;
}
async function convert() {
    await apply();
    const fileName = document.getElementById('fileName').value;
    const speed = document.getElementById("speed").value;
    const {bpm, musicL, musicBody} = getMusicInfoViaElement()
    const {noteValue, note32Value, note6Value} = calcNoteValue(bpm)

    const outInfo = Array()
    xLine.forEach((val1, i) => {
        val1.forEach((val2, j) => {
            val2.forEach((val3, k) => {
                if (val3.note) {
                    const tmp = k < 8 ? calcNote(j * noteValue, k * note32Value, musicBody) : calcNote(j * noteValue, k % 8 * note6Value, musicBody)
                    outInfo.push(Array(1, i+1, speed, tmp))
                }
            })
        })
    })
    createAndDownloadCsv(fileName, outInfo, bpm, musicL, musicBody);
}

//CSV出力
function createAndDownloadCsv(fileName, outInfo, bpm, musicL, musicBody) {
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const data = fileName + "," + bpm + "," + musicL + "," + musicBody + "\r\n" + outInfo.map((record) => record.join(',')).join('\r\n');
    const blob = new Blob([ bom, data ], { 'type' : 'text/csv' });

    const downloadLink = document.createElement('a');
    downloadLink.download = fileName + '.csv';
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.dataset.downloadurl = ['text/plain', downloadLink.download, downloadLink.href].join(':');
    downloadLink.click();
}

//CSVインポートを検知
const csvFile = document.getElementById('csv');
csvFile.addEventListener('change', function(e) {
    try {
        // ファイル情報を取得
        const fileData = e.target.files[0];
        console.log(fileData); // 取得した内容の確認用

        // CSVファイル以外は処理を止める
        if(!fileData.name.match('.csv$')) {
            throw 'CSVファイルを選択してください'
        }

        // FileReaderオブジェクトを使ってファイル読み込み
        const reader = new FileReader();
        // ファイル読み込みに成功したときの処理
        reader.onload = function() {
            const cols = reader.result.split('\r');
            const data = cols.map((val => val.split(',')))

            csvReflect(data);
        }
        // ファイル読み込みを実行
        reader.readAsText(fileData);
    } catch(err) {
        alert(err)
        return
    }
}, false);

//csvファイルをエディタに反映
async function csvReflect(data) {
    for (let i = 0; i < xLine.length; i++) {
        for (let j = 0; j < xLine[i].length; j++) {
            for (let k = 0; k < xLine[i][j].length; k++) {
                xLine[i][j][k].note = false;
            }
        }
    }
    document.getElementById('bpm').value = data[0][1];
    document.getElementById('musicL').value = data[0][2];
    document.getElementById('musicBody').value = data[0][3];
    document.getElementById('speed').value = data[1][2];

    await apply();
    await csvMatch(data, data[0][3], data[0][1]);
    await update();
    await draw();
}

//csvのデータを入れ込む
function csvMatch(data, musicBody, bpm) {
    const {noteValue, note32Value, note6Value} = calcNoteValue(bpm)
    return new Promise(function(resolve) {
        for (let i = 1; i < data.length; i++) {
            var flg = false;
            for (let j = 0; j < xLine[data[i][1] - 1].length; j++) {
                for (let k = 0; k < xLine[data[i][1] - 1][j].length; k++) {
                    if (k < 8 && Math.floor(data[i][3]) == Math.floor(j * noteValue + k * note32Value + musicBody * 1000)) {
                        xLine[data[i][1] - 1][j][k].note = true;
                        flg = true;
                        break;
                    } else if (k >= 8 && Math.floor(data[i][3]) == Math.floor(j * noteValue + k % 8 * note6Value + musicBody * 1000)) {
                        xLine[data[i][1] - 1][j][k].note = true;
                        flg = true;
                        break;
                    }
                }
                if (flg == true) {
                    break;
                }
            }
        }
        resolve();
    })
}

//アップデート
function update() {
    return new Promise(function(resolve) {
        if (qLineMargin / 9 >= Q_LINE_T || divValue == 8) {
            noteH = qLineMargin / 9;
        } else {
            noteH = Q_LINE_T;
        }
    
        const laneMargin = canvasW / 5;
        laneSet = [laneMargin / 2, laneMargin * 1.5, laneMargin * 2.5, laneMargin * 3.5, laneMargin * 4.5];
    
        noteW = laneMargin / 3;
    
        quarterLine.forEach((val) => val.update() )
    
        editLane.forEach((val) => val.update() )
    
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < qLineQty; j++) {
                for (let k = 0; k < 14; k++) {
                    xLine[i][j][k].update();
                }
            }
        }

        resolve();
    })
}

//描画
function draw() {
    return new Promise(function(resolve) {
        ctx.clearRect(0, 0, can.width, can.height);

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < qLineQty; j++) {
                for (let k = 0; k < 14; k++) {
                    xLine[i][j][k].draw();
                }
            }
        }

        for (let i = 0; i < qLineQty; i++) {
            quarterLine[i].draw();
        }

        editLane.forEach((val) => val.draw())

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < qLineQty; j++) {
                for (let k = 0; k < 14; k++) {
                    xLine[i][j][k].drawNote();
                }
            }
        }

        resolve();
    })
}

function getMusicInfoViaElement() {
    const bpm = document.getElementById('bpm').value;
    const musicL = document.getElementById('musicL').value;
    const musicBody = document.getElementById('musicBody').value;

    return {bpm, musicL, musicBody}
}

function calcNoteValue(bpm) {
    const noteValue = 60000 / bpm; //4分音符の長さ
    const note32Value = noteValue / 8;
    const note6Value = noteValue / 6;
    
    return {noteValue, note32Value, note6Value}
}

//オンロードでゲーム開始
window.onload = async function() {
    const {bpm, musicL} = getMusicInfoViaElement()

    await getWidth();
    await numberQLine(bpm, musicL);
    await setCanvas();
    await setQLine();
    await setXLine();
    await update();
    await draw();
    await scrollBottom();
}
