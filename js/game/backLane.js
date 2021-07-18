class BackLane {
  constructor(no) {
    this.no = no;
    this.width = lane.width;
    this.margin = lane.margin;
    this.color = 'rgb(' + lane.color + ')';
    this.actColor = lane.actColor;
    this.x = (CANVAS_W - this.width * 4 - this.margin * 3) / 2 + (this.width + this.margin) * no;
    this.key = inputKey.lane[no];
    this.note = null;
  }

  generateNote(data) {    // ノーツの種類、レーン番号、スピード、到達時間が記された配列
    this.note = [];
    data.forEach((val, index) => {
      switch (val[0]) {
        case 1:
          this.note[index] = new SingleNote(val[2], val[3])
          break;
        case 2:
          this.note[index] = new LongNote(val[2], val[3], val[4])
          break;
      }
    });
  }

  update() {
    this.note.forEach(val => val.update());
  }

  // 自身のレーン上にあるノーツのヒットを判定し、処理
  judge() {
    calcElapsedTime();                  // 経過時間を更新
    const TARGET = this.note.filter(val => val.checkHit(note.hitRange[3])); // ヒットしているノーツを抽出

    // TARGETの先頭から処理、先頭ノーツのグレードがbadだった場合のみ2つ目以降のノーツを処理し、それらのノーツがbadだった場合は中断
    const GRADE = [3]
    for (let i = 0; TARGET[i] && GRADE[0] === 3; i++) {
      GRADE[i] = TARGET[i].getGrade();
      if (i > 0 && GRADE[i] === 3) {  // 2つ目以降のノーツがbadの場合はそこで中断
        break;
      }
      if (GRADE[i] < 3) {
        sound.playSE(sound.seList[0]);    // bad以外の判定ならばヒットSEを鳴らす
      } else {
        sound.playSE(sound.seList[1]);    // bad判定ならばバッドSEを鳴らす
      }
      gameScore.calcScore(GRADE[i]);      // スコアを更新
      JUDGE_LINE.setGrade(GRADE[i]); // ノーツヒットのグレードを描画
      TARGET[i].close();              // 判定済みのノーツ処理を停止
    }
  }

  draw() {
    CTX.fillStyle = this.color;
    CTX.fillRect(this.x, 0, this.width, CANVAS_H);
    CTX.font = '200px Arial Black';
    CTX.strokeStyle = 'rgba(' + this.actColor + ', 0.7)';
    CTX.strokeText(this.key.toUpperCase(), this.x + this.width / 2, CANVAS_H - 160);

    if (inputKey.status[this.key]) {
      const GRAD = CTX.createLinearGradient(this.x, JUDGE_LINE.centerY, this.x, CANVAS_H / 3);
      GRAD.addColorStop(0.0, 'rgba(' + this.actColor + ', 0.6)');
      GRAD.addColorStop(1.0, 'rgba(' + this.actColor + ', 0)');
      CTX.fillStyle = GRAD;
      CTX.fillRect(this.x, 0, this.width, JUDGE_LINE.centerY);
    }
  }

  drawNote() {
    this.note.forEach(val => val.draw(this.x));
  }
}
