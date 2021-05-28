class EditLane {
    constructor(no) {
        this.no = no;
        this.x;
    }

    update() {
        this.x = laneSet[this.no];
    }

    draw() {
        ctx.beginPath();
        ctx.strokeStyle = "#757575";
        ctx.lineWidth = LANE_T;
        ctx.moveTo(this.x, 0);
        ctx.lineTo(this.x, canvasH);
        ctx.stroke();
    }
}
