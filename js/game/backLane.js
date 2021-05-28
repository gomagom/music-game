class BackLane {
    constructor(no) {
        this.x = LANE_SET[no];
    }

    draw() {
        ctx.beginPath();
        ctx.strokeStyle = "#233B6C";
        ctx.moveTo(this.x, 0);
        ctx.lineTo(this.x, CANVAS_H);
        ctx.stroke();
    }
}
