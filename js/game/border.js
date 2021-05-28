class Border {
    constructor() {
        this.width = CANVAS_W;
        this.height = 3;
        this.x = 0;
        this.y = CANVAS_H - 50
        this.py = this.y + this.height / 2;
    }

    draw() {
        ctx.beginPath();
        ctx.strokeStyle = "#0F1A45";
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    update() {

    }
}
