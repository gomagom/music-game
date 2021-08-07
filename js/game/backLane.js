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

  generateNote(data) {
    /* ここにコードを挿入してください */
  }

  update() {
    /* ここにコードを挿入してください */
  }

  judge() {
    /* ここにコードを挿入してください */
  }

  draw() {
    CTX.fillStyle = this.color;
    CTX.fillRect(this.x, 0, this.width, CANVAS_H);
    CTX.font = '200px Arial Black';
    CTX.strokeStyle = 'rgba(' + this.actColor + ', 0.7)';
    CTX.strokeText(this.key.toUpperCase(), this.x + this.width / 2, CANVAS_H - 160);

    /* ここにコードを挿入してください */
  }

  drawNote() {
    /* ここにコードを挿入してください */
  }
}
