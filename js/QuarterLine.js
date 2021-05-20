class QuarterLine {
    constructor(no) {
        this.no = no;
        this.y = qLineMargin * this.no + qLineMargin / 4;
    }

    update() {
        this.y = qLineMargin * this.no + qLineMargin / 4;
    }

    draw() {
        ctx.beginPath();
        ctx.strokeStyle = "#3ec1d3";
        ctx.lineWidth = Q_LINE_T;
        ctx.moveTo(0, Math.round(this.y));
        ctx.lineTo(canvasW, Math.round(this.y));
        ctx.stroke();
    }
}