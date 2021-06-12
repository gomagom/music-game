class JudgeLine {
    constructor() {
        this.height = 40;
        this.width = LANE.width * 4 + LANE.margin * 5;
        this.x = (CANVAS_W - this.width) / 2;
        this.centerY = CANVAS_H * 7 / 8;
        this.y = this.centerY - this.height / 2;
        this.color = '#000'; 
    }

    draw() {
        CTX.fillStyle = this.color;
        CTX.fillRect(this.x, this.y, this.width, this.height);
    }
}

class BackLane {
    constructor(no) {
        this.no = no;
        this.width = LANE.width;
        this.margin = LANE.margin;
        this.color = LANE.color;
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

    }

    updateNote() {

    }

    checkHit() {

    }

    draw() {
        CTX.fillStyle = this.color;
        CTX.fillRect(this.x, 0, this.width, CANVAS_H);
    }

    drawNote() {
        this.note.forEach(val => val.draw(this.x));
    }
}

class SingleNote {
    constructor(speed, reachTime) {
        this.height = NOTE.height;
        this.width = NOTE.width;
        this.color = NOTE.color;
        this.canterY = -this.height;
        this.speed = speed;             // px/ms
        this.reachTime = reachTime;
        this.appearTime = this.reachTime - (JUDGE_LINE.centerY + this.height / 2) / this.speed;
        this.hideTime = this.reachTime + (CANVAS_H - JUDGE_LINE.centerY + this.height / 2) / this.speed;
    }

    checkHit() {

    }

    calcLocation() {

    }

    draw(x) {
        if (this.appearTime <= TIME.elapsed && TIME.elapsed<= this.hideTime) {
            const Y = JUDGE_LINE.centerY - (this.reachTime - TIME.elapsed) * this.speed;
            CTX.fillStyle = this.color;
            CTX.fillRect(x, Y, this.width, this.height);
        }
    }
}

class LongNote {
    constructor(speed, reachTime) {

    }
}
