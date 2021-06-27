class SingleNote {
    constructor(speed, reachTime) {
        this.height = NOTE.height;
        this.width = NOTE.width;
        this.frameColor = 'rgb(' + NOTE.frameColor + ')';
        this.bodyColor = 'rgba(' + NOTE.bodyColor + ')';
        this.canterY = -this.height;
        this.speed = speed;             // px/ms
        this.reachTime = reachTime;     // ゲーム開始時からjudgeLineに到達するまでの時間
        this.appearTime = this.reachTime - (JUDGE_LINE.centerY + this.height / 2) / this.speed; // canvasに入る時間
        this.hideTime = this.reachTime + (CANVAS_H - JUDGE_LINE.centerY + this.height / 2) / this.speed;    // canvasから出る時間
        this.act = true;                // 自身がヒット処理対象かどうか
        this.show = false;              // 自身がcanvasに描画されるかどうか
    }

    // 自身のヒットグレードを判定し、返却
    getGrade() {
        let grade = 3;
        for (let i = 2; i >= 0; i--) {
            if (this.checkHit(NOTE.hitRange[i])) {
                grade = i;
            }
        }
        return grade;
    }

    // 自身がヒットしているか判定
    checkHit(range) {
        if (this.act && Math.abs(TIME.elapsed - this.reachTime) <= range) {
            return true;
        } else {
            return false;
        }
    }

    // canvas内に入った段階で描画フラグを立てる
    updateShow() {
        if (this.act || this.show) {
            if (this.appearTime <= TIME.elapsed && TIME.elapsed <= this.hideTime) {
                this.show = true;
            } else {
                this.show = false;
            }
        }
    }

    // 自身の状態を確認し、判定ラインを通り過ぎた場合に判定処理を止める
    update() {
        this.updateShow();
        if (!this.act) {
            return;
        }

        // 判定ラインを
        if (this.reachTime < TIME.elapsed && !this.checkHit(NOTE.hitRange[3])) {
            updateGameScore(3);         // badとしてスコア加算
            JUDGE_LINE.drawGrade(3);
            this.act = false;
        }
    }

    draw(x) {
        if (this.show) {
            this.centerY = JUDGE_LINE.centerY - (this.reachTime - TIME.elapsed) * this.speed;
            CTX.fillStyle = this.bodyColor;
            CTX.fillRect(x, this.centerY - this.height / 2, this.width, this.height);
            CTX.strokeStyle = this.frameColor;
            CTX.strokeRect(
                x + LINE_WIDTH / 2,
                this.centerY - this.height / 2 + LINE_WIDTH / 2,
                this.width - LINE_WIDTH,
                this.height - LINE_WIDTH
            );
        }
    }

    // 自身の処理を止める
    close() {
        this.act = false;
        this.show = false;
    }
}
