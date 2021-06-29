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
        switch (grade) {
            case 0:
                this.point += 100 + this.combo;
                this.perfect++;
                this.combo++;
                break;
            case 1:
                this.point += 80 + this.combo * 0.8;
                this.great++;
                this.combo++;
                break;
            case 2:
                this.point += 50 + this.combo * 0.5;
                this.good++;
                this.combo++;
                break;
            case 3:
                this.bad++;
                this.combo = 0;
                break;
        }
    
        if (this.maxCombo < this.combo) {
            this.maxCombo = this.combo;
        }
    }
}
