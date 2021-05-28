class Note {
    constructor(x, speed, time) {
        this.width = NOTE_W;
        this.height = NOTE_H;
        this.lane = x - 1; //ノーツのレーン
        this.x = NOTE_SET[x - 1] - this.width / 2;
        this.py = -NOTE_H; //ノーツの中心のy座標
        this.y = this.py - this.height / 2; //ノーツの左上のy座標
        this.time = time;
        this.speed = speed;
        this.myKey = NOTE_KEY[x - 1];
        this.live = 0; //ノーツの一生(0 = 生まれる前, 1 = 生存, 2 = 死)
        this.xTime = 0; //ノーツが画面上部に生成されるべき時間
        this.over = false; //ノーツの判定が前のノーツの判定と重なっているかどうか
        this.perfectHit = this.speed * (PERFECT_HIT / 2); //以下それぞれのヒットの範囲
        this.greatHit = this.speed * (GREAT_HIT / 2);
        this.goodHit = this.speed * (GOOD_HIT / 2);
        this.badHit = this.speed * (BAD_HIT / 2);
    }

    update() {
        if (this.live == 1) {
            this.y += this.speed;
            this.py += this.speed;

            if (checkHit(this.py, this.badHit, border.py) && !isHit[this.lane]) {
                isHit[this.lane] = this.time;
            }

            if (this.time - isHit[this.lane] <= BAD_HIT * FLAME_TIME + FLAME_TIME && this.time != isHit[this.lane] && !this.over) {
                this.over = true;
            }

            if (isHit[this.lane] == this.time) {
                if (this.over && !key[this.myKey]) {
                    this.over = false;
                }

                if (this.py > border.py + this.badHit) {
                    combo = 0;
                    isHit[this.lane] = false;
                }

                if (!this.over && key[this.myKey]) {
                    if (checkHit(this.py, this.perfectHit, border.py)) {
                        SE_HIT.currentTime = 0;
                        SE_HIT.play();
                        this.live++;
                        combo++;
                        perfect++;
                        isHit[this.lane] = false;
                    } else if (checkHit(this.py, this.greatHit, border.py)) {
                        SE_HIT.currentTime = 0;
                        SE_HIT.play();
                        this.live++;
                        combo++;
                        great++;
                        isHit[this.lane] = false;
                    } else if (checkHit(this.py, this.goodHit, border.py)) {
                        SE_HIT.currentTime = 0;
                        SE_HIT.play();
                        this.live++;
                        combo++;
                        good++;
                        isHit[this.lane] = false;
                    } else if (checkHit(this.py, this.badHit, border.py)) {
                        SE_BAD.currentTime = 0;
                        SE_BAD.play();
                        this.live++;
                        combo = 0;
                        bad++;
                        isHit[this.lane] = false;
                    }
                }
            }

            if (this.y > CANVAS_H && !checkHit(this.py, this.badHit, border.py)) {
                this.live++;
                bad++;
            }

        }

        if (this.live == 0 && elapsedTime >= this.xTime) {
            this.live++;
        }

    }

    draw() {
        if (this.live == 1) {
            ctx.fillStyle = "#008000"
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    prepare() {
        this.xTime = this.time - (border.py - this.py) * (FLAME_TIME / this.speed);

        if (this.xTime <= 0) {
            this.live++;

            this.y += -this.xTime * this.speed / FLAME_TIME; 
            this.py += -this.xTime * this.speed / FLAME_TIME; 

            this.draw()
        }
    }

}
