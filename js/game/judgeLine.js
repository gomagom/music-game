class JudgeLine {
  constructor() {
    this.height = 40;
    this.width = lane.width * 4 + lane.margin * 5;
    this.x = (CANVAS_W - this.width) / 2;
    this.centerY = CANVAS_H * 5 / 6;
    this.y = this.centerY - this.height / 2;
    this.color = '#e4007f';
    this.targetTime = 0;
    this.targetTimeL = 750;
    this.text;
    this.textColor;
  }

  draw() {
    CTX.fillStyle = this.color;
    CTX.fillRect(this.x, this.y, this.width, this.height);
    if (this.targetTime > time.elapsed) {
      CTX.save();
      CTX.beginPath();
      CTX.font = '200px Arial Black';
      CTX.textAlign = 'center';
      CTX.textBaseline = 'middle';
      CTX.fillStyle = this.textColor;
      CTX.fillText(this.text, CANVAS_W / 2, this.y - 200);
      CTX.restore();
    }
  }

  drawGrade(grade) {
    const STRING = ['Perfect!', 'Great!', 'Good!', 'Bad...'];
    const COLOR = [
      [255, 204, 0, 0.8],
      [153, 0, 204, 0.7],
      [51, 204, 51, 0.8],
      [51, 51, 51, 0.7]
    ]
    this.targetTime = time.elapsed + this.targetTimeL;
    this.text = STRING[grade];
    this.textColor = 'rgba(' + COLOR[grade] + ')';
  }

  reset() {
    this.targetTime = 0;
  }
}
