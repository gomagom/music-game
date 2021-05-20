class XthLine {
    constructor(lane, group, no) {
        this.lane = lane;
        this.group =group;
        this.no = no;
        this.x1;
        this.x2;
        this.set = false;
        this.note = false;
        this.margin; //線の上下にある当たり判定の範囲
        this.noteX;
        this.noteY;
        switch (this.no) {
            case 0:
                this.value = 1;
                this.noteColor = "#212121";
                break;
            case 4:
                this.value = 2;
                this.color = "#ff9a00";
                this.noteColor = "#212121";
                break;
            case 2:
            case 6:
                this.value = 4;
                this.color = "#ffb84c";
                this.noteColor = "#212121";
                break;
            case 1:
            case 3:
            case 5:
            case 7:
                this.value = 8;
                this.color = "#ffd699";
                this.noteColor = "#212121";
                break;
            case 8:
            case 10:
            case 12:
                this.value = 3;
                this.color = "#ff165d";
                this.noteColor = "#757575";
                break;
            case 9:
            case 11:
            case 13:
                this.value = 6;
                this.color = "#b20f41";
                this.noteColor = "#757575";
                break;
        }
    }

    update() {
        if (divValue >= this.value && 
            ((this.value % 3 == 0 && divValue % 3 == 0) || (this.value % 3 != 0 && divValue % 3 != 0))) {
            this.set = true;
        } else {
            this.set = false;
        }

        if (this.value % 3 != 0) {
            this.y = quarterLine[this.group].y + qLineMargin * this.no / 8;
        } else {
            this.y = quarterLine[this.group].y + qLineMargin * (this.no % 8) / 6;
        }

        this.x1 = laneSet[this.lane];
        this.x2 = laneSet[this.lane + 1];
        this.noteY = this.y - noteH / 2;
        this.noteX = this.x1 + (this.x2 - this.x1 - noteW) / 2;

        this.margin = qLineMargin / (2 * divValue);

        if (checkHit(this.lane, this.y, this.set, this.margin)) {
            if ((this.no == 0 || this.no == 8) && 
            (xLine[this.lane][this.group][0].note || xLine[this.lane][this.group][8].note)) {
                xLine[this.lane][this.group][0].note = false;
                xLine[this.lane][this.group][8].note = false;
            } else if ((this.no == 4 || this.no == 11) && 
            (xLine[this.lane][this.group][4].note || xLine[this.lane][this.group][11].note)) {
                xLine[this.lane][this.group][4].note = false;
                xLine[this.lane][this.group][11].note = false;
            } else {
                this.note = !this.note; //状態を切り替える
            }
        }
    }

    draw() {
        if (this.set) {
            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = LINE_T;
            ctx.moveTo(this.x1, Math.round(this.y));
            ctx.lineTo(this.x2, Math.round(this.y));
            ctx.stroke();
        }
    }

    drawNote() {
        if (this.note) {
            ctx.fillStyle = this.noteColor;
            ctx.fillRect(this.noteX, Math.round(this.noteY), noteW, Math.floor(noteH));
        }
    }
}