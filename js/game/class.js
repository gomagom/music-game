class JudgeLine {
    constructor() {
        this.width = LANE.width * 4 + LANE.margin * 5;
    }
}

class BackLane {
    constructor(no) {
        this.width = 250;
        this.margin = 100;
        this.color = '#eee';
        this.x = (CAN.width - this.width * 4 - this.margin * 3) / 2 + (this.width + this.margin) * no;
        this.key = KEY.lane[no];
        this.note = [];
    }

    update() {

    }

    updateNote() {

    }

    checkHit() {

    }

    draw() {
        CTX.fillStyle = this.color;
        CTX.fillRect(this.x, 0, this.width, CAN.width);
    }
}

class SingleNote {
    constructor(speed, reachTime) {
        this.height = 75;
        this.color = '#000';
        this.py = -this.height;
    }

    draw() {

    }
}

class LongNote {
    constructor(speed, reachTime) {

    }
}