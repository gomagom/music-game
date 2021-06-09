class JudgmentLine {
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
        this.key = KEY[no];
        this.note
    }

    update() {

    }

    updateNote() {

    }

    draw() {
        CTX.fillStyle = this.color;
        CTX.fillRect(this.x, 0, this.width, CAN.width);
    }
}

class SingleNote {
    constructor(laneNo, speed, reachTime) {

    }
}

class LongNote {
    constructor(speed, reachTime) {

    }
}