class JudgeLine {
    constructor() {
        this.height = 40;
        this.width = LANE.width * 4 + LANE.margin * 5;
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
        if (this.targetTime > TIME.elapsed) {
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
        const STRING = ['Parfect!', 'Great!', 'Good!', 'Bad...'];
        const COLOR = [
            [255, 204, 0, 0.8],
            [153, 0, 204, 0.7],
            [51, 204, 51, 0.8],
            [51, 51, 51, 0.7]
        ]
        this.targetTime = TIME.elapsed + this.targetTimeL;
        this.text = STRING[grade];
        this.textColor = 'rgba(' + COLOR[grade] + ')';
    }
}

class BackLane {
    constructor(no) {
        this.no = no;
        this.width = LANE.width;
        this.margin = LANE.margin;
        this.color = 'rgb(' + LANE.color + ')';
        this.actColor = LANE.actColor;
        this.x = (CANVAS_W - this.width * 4 - this.margin * 3) / 2 + (this.width + this.margin) * no;
        this.key = KEY.lane[no];
        this.note = [];
    }

    generateNote(data) {    // ノーツの種類、レーン番号、スピード、到達時間が記された配列
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
        const TARGET = this.note.filter(val => val.checkHit(NOTE.hitRange[3])); // ヒットしているノーツを抽出

        // TARGETの先頭から処理、先頭ノーツのグレードがbadだった場合のみ2つ目以降のノーツを処理し、それらのノーツがbadだった場合は中断
        const GRADE = [3]
        for (let i = 0; TARGET[i] && GRADE[0] === 3; i++) {
            GRADE[i] = TARGET[i].getGrade();
            if (i > 0 && GRADE[i] === 3) {
                break;
            }
            if (GRADE[i] < 3) {
                playSE(SOUND.seList[0]);
            } else {
                playSE(SOUND.seList[1]);
            }
            updateGameScore(GRADE[i]);      // スコアを更新
            JUDGE_LINE.drawGrade(GRADE[i]);
            TARGET[i].close();          // 判定済みのノーツ処理を停止
        }
    }

    draw() {
        CTX.fillStyle = this.color;
        CTX.fillRect(this.x, 0, this.width, CANVAS_H);

        CTX.save();
        CTX.beginPath();
        CTX.font = '200px Arial Black';
        CTX.textAlign = 'center';
        CTX.textBaseline = 'middle';
        CTX.strokeStyle = 'rgba(' + this.actColor + ', 0.7)';
        CTX.strokeText(this.key.toUpperCase(), this.x + this.width / 2, CANVAS_H - 160);
        CTX.restore();

        if (KEY.status[this.key]) {
            CTX.beginPath();
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

class SingleNote {
    constructor(speed, reachTime) {
        this.height = NOTE.height;
        this.width = NOTE.width;
        this.frameColor = 'rgb(' + NOTE.frameColor + ')';
        this.bodyColor = 'rgba(' + NOTE.bodyColor + ')';
        this.canterY = -this.height;
        this.speed = speed;             // px/ms
        this.reachTime = reachTime;
        this.appearTime = this.reachTime - (JUDGE_LINE.centerY + this.height / 2) / this.speed;
        this.hideTime = this.reachTime + (CANVAS_H - JUDGE_LINE.centerY + this.height / 2) / this.speed;
        this.act = true;
        this.show = false;
    }

    getGrade() {
        let grade = 3;
        for (let i = 2; i >= 0; i--) {
            if (this.checkHit(NOTE.hitRange[i])) {
                grade = i;
            }
        }
        return grade;
    }

    checkHit(range) {
        if (this.act && Math.abs(TIME.elapsed - this.reachTime) <= range) {
            return true;
        } else {
            return false;
        }
    }

    updateShow() {
        if (this.act || this.show) {
            if (this.appearTime <= TIME.elapsed && TIME.elapsed <= this.hideTime) {
                this.show = true;
            } else {
                this.show = false;
            }
        }
    }

    update() {
        this.updateShow();
        if (!this.act) {
            return;
        }

        if (this.reachTime < TIME.elapsed && !this.checkHit(NOTE.hitRange[3])) {
            updateGameScore(3);
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

    close() {
        this.act = false;
        this.show = false;
    }
}

class LongNote {
    constructor(speed, reachTime) {

    }
}
