class GameScoreManager {
  constructor() {
    this.point = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.perfect = 0;
    this.great = 0;
    this.good = 0;
    this.bad = 0;
  }

  calcScore(grade) {
    /* ここにコードを挿入してください */
  }

  reset() {
    for (const key in this) {
      this[key] = 0;
    }
  }
}
