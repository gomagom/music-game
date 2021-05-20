//曲情報
let bpm = 135;
let musicL = 60;
let musicBody = 10;
let fileName;

//csvファイル
let csvFile = document.getElementById('csv');

//出力情報
let noteValue; //4分音符
let note32Value; //32分音符
let note6Value; //6連符
var outInfo = []; //種類、レーン番号、速度、時間

//キャンバスサイズ
let canvasW;
let canvasH;

//レーンの線の位置
let laneMargin;
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

//ボタン
let infoSubmit = document.getElementById('submit');

//キャンバス
let can = document.getElementById("can2");
let ctx = can.getContext("2d");
let cst = window.getComputedStyle(can);
can.setAttribute('style', 'background-color: #f6f7d7');

//レーンの線の実体
let editLane = [];

for (let i = 0; i < 5; i++) {
    editLane[i] = new EditLane(i);
}

//4部音符線の実体
let quarterLine = [];
let qLineQty; //4部音符線の数

function numberQLine() {
    return new Promise(function(resolve) {
        qLineQty = musicL / (60 / bpm) + 1;
        qLineQty = Math.floor(qLineQty);
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
infoSubmit.addEventListener('click', apply);

//適用処理
async function apply() {
    bpm = document.getElementById('bpm').value;
    musicL = document.getElementById('musicL').value;
    musicBody = document.getElementById('musicBody').value;
    noteValue = 60000 / bpm; //4分音符の長さ
    note32Value = noteValue / 8;
    note6Value = noteValue / 6;
    await numberQLine();
    await setCanvas();
    await setQLine();
    await setXLine();
    await update();
    await draw();
}

//クオンタイズセレクトボックス
let quantizeSelect = document.getElementById('quantize');

quantizeSelect.onchange = async function() {
    divValue = this.value;
    await update();
    await draw();
}

//縮尺変更
let canScale = document.getElementById('canScale');

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
        cst = window.getComputedStyle(can);
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
function convert() {
    fileName = document.getElementById('fileName').value;
    var count = 0;
    for (let i = 0; i < xLine.length; i++) {
        for (let j = 0; j < xLine[i].length; j++) {
            for (let k = 0; k < xLine[i][j].length; k++) {
                if (xLine[i][j][k].note) {
                    outInfo[count] = [];
                    outInfo[count][0] = 1;
                    outInfo[count][1] = i + 1;
                    outInfo[count][2] = 20;
                    if (k < 8) {
                        outInfo[count][3] = Math.round((j * noteValue + k * note32Value + musicBody * 1000) * 100) / 100;
                    } else {
                        outInfo[count][3] = Math.round((j * noteValue + k % 8 * note6Value + musicBody * 1000) * 100) / 100;
                    }
                    count++;
                }
            }
        }
    }
    createAndDownloadCsv();
}

//CSV出力
function createAndDownloadCsv() {
    let bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    let data = fileName + "," + bpm + "," + musicL + "," + musicBody + "\n" + outInfo.map((record) => record.join(',')).join('\r\n');
    let blob = new Blob([ bom, data ], { 'type' : 'text/csv' });

    let downloadLink = document.createElement('a');
    downloadLink.download = fileName + '.csv';
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.dataset.downloadurl = ['text/plain', downloadLink.download, downloadLink.href].join(':');
    downloadLink.click();
}

//CSVインポートを検知
csvFile.addEventListener('change', function(e) {
    // ファイル情報を取得
    var fileData = e.target.files[0];
    console.log(fileData); // 取得した内容の確認用

    // CSVファイル以外は処理を止める
    if(!fileData.name.match('.csv$')) {
        alert('CSVファイルを選択してください');
        return;
    }

    // FileReaderオブジェクトを使ってファイル読み込み
    var reader = new FileReader();
    // ファイル読み込みに成功したときの処理
    reader.onload = function() {
        var cols = reader.result.split('\n');
        var data = [];
        for (var i = 0; i < cols.length; i++) {
            data[i] = cols[i].split(',');
        }
        csvReflect(data);
    }
    // ファイル読み込みを実行
    reader.readAsText(fileData);
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
    await apply();
    await csvMatch(data);
    await update();
    await draw();
}

//csvのデータを入れ込む
function csvMatch(data) {
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
    
        laneMargin = canvasW / 5;
        laneSet = [laneMargin / 2, laneMargin * 1.5, laneMargin * 2.5, laneMargin * 3.5, laneMargin * 4.5];
    
        noteW = laneMargin / 3;
    
        for (let i = 0; i < qLineQty; i++) {
            quarterLine[i].update();
        }
    
        for (let i = 0; i < editLane.length; i++) {
            editLane[i].update();
        }
    
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

        for (let i = 0; i < editLane.length; i++) {
            editLane[i].draw();
        }

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

//オンロードでゲーム開始
window.onload = async function() {
    await getWidth();
    await numberQLine();
    await setCanvas();
    await setQLine();
    await setXLine();
    await update();
    await draw();
    await scrollBottom();
}