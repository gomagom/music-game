class LongNote extends Note {
    constructor(x, speed, time, endTime) {
        super(x, speed, time);

        this.endTime = endTime;
        this.endPy = this.py - (this.endTime - this.time) * this.speed / FLAME_TIME; //ロングノーツの終わりの座標
        this.height = NOTE_H + (this.py - this.endPy);
        this.y = this.endPy - NOTE_H / 2; //ノーツの左上のy座標
        this.firstHit = false;
        this.comboCount = COMBO_FLAME;
    }

    update() {
        if (this.live == 1) { // ノーツが生きているかを判定
            this.y += this.speed; // 位置を更新
            this.py += this.speed;
            this.endPy += this.speed;

            if (checkHit(this.py, this.badHit, border.py) && !isHit[this.lane]) {
                isHit[this.lane] = this.endTime;
            }

            if (this.time - isHit[this.lane] <= BAD_HIT * FLAME_TIME + FLAME_TIME && this.endTime != isHit[this.lane] && !this.over) {
                this.over = true;
            }

            if (isHit[this.lane] == this.endTime) {
                if (this.over && !key[this.myKey]) {
                    this.over = false;
                }

                if (this.py > border.py + this.badHit && !this.firstHit) {
                    this.firstHit = true;
                    combo = 0;
                    bad++;
                }

                if (this.endPy > border.py + this.badHit) {
                    isHit[this.lane] = false;
                }

                if (!this.over && key[this.myKey]) {
                    if (!this.firstHit) {
                        if (checkHit(this.py, this.perfectHit, border.py)) {
                            this.firstHit = true;
                            combo++;
                            perfect++;
                        } else if (checkHit(this.py, this.greatHit, border.py)) {
                            this.firstHit = true;
                            combo++;
                            great++;
                        } else if (checkHit(this.py, this.goodHit, border.py)) {
                            this.firstHit = true;
                            combo++;
                            good++;
                        } else if (checkHit(this.py, this.badHit, border.py)) {
                            this.firstHit = true;
                            combo = 0;
                            bad++;
                        }
                    } else {
                        this.comboCount++;
                        if (this.comboCount >= COMBO_FLAME) {
                            combo++;
                            this.comboCount = 0;
                        }

                    }

                }

            }

            if (this.y > CANVAS_H && !checkHit(this.endPy, this.badHit, border.py)) {
                this.live++;
            }
            
        }

        if (this.live == 0 && elapsedTime >= this.xTime) { // 時間になったらノーツを生成する
            this.live++;
        }

        
    }

}
