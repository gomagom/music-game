class musicalScoreManager {
  constructor() {
    this.wholeScore = null;
    this.partScore = null;
  }

  // 実行用の譜面を準備
  async prepareScore() {
    // CSVから読み込んだ譜面データを受け取る
    if (element.uploadCSVType.checked) {
      this.wholeScore = await this.importCSV();
    } else {
      this.wholeScore = await this.getCSV();
    }

    this.wholeScore.sort((first, second) => first[3] - second[3]);    // 到達時間順に並べ替える
    time.end = this.wholeScore[this.wholeScore.length - 1][3] + 1500; // 譜面の終了時間を取得

    this.cutScore(); // 譜面をレーン毎のデータにする

    return 1;
  }

  // ローカルのCSVファイルを読み込む
  importCSV() {
    return new Promise((resolve) => {
      const FILE = element.uploadCSVFile;
      const READER = new FileReader();
      READER.readAsText(FILE.files[0]);
      READER.addEventListener('load', () => {
        resolve(this.convertCSVtoArray(READER.result));
      });
    });
  }

  // sheet/のCSVファイルを読み込む
  getCSV() {
    return new Promise((resolve) => {
      const SELECT = document.getElementById('select-csv-file');
      const REQ = new XMLHttpRequest();                         // HTTPでファイルを読み込むためのXMLHttpRrequestオブジェクトを生成
      REQ.open('get', 'sheet/' + SELECT.value + '.csv', true);  // アクセスするファイルを指定
      REQ.send(null);                                           // HTTPリクエストの発行
      REQ.addEventListener('load', () => {
        resolve(this.convertCSVtoArray(REQ.responseText));      // 読み込んだ文字データを関数に渡して終了
      });
    });
  }

  // CSVで読み込んだ文字データを2次元配列に格納
  convertCSVtoArray(str) {
    const TMP = str.split('\r\n');                              // 改行位置で分割して格納
    TMP.shift();                                                // 曲情報を含む先頭行を削除
    const RESULT = TMP.map(val => val.split(',').map(Number));  // ','の位置で分割して格納

    return RESULT;
  }

  // 譜面データをレーン毎に切り分ける
  cutScore() {
    this.partScore = new Array(4);

    // レーン番号を元に分ける
    for (let i = 0; i < this.partScore.length; i++) {
      this.partScore[i] = this.wholeScore.filter((val, index) => this.wholeScore[index][1] === i + 1);
    }
  }

  // 譜面をそれぞれのレーンにセット
  setScore() {
    BACK_LANE.forEach((val, index) => val.generateNote(this.partScore[index]));
  }
}
