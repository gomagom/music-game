// 画面のリフレッシュレートに合わせてループ処理
function gameLoop() {
    if (gameActive) {
        calcElapsedTime();
    } else {
        calcStoppedTime();
    }

    BACK_LANE.forEach(val => val.update());

    CTX.clearRect(0, 0, CANVAS_W, CANVAS_H);
    BACK_LANE.forEach(val => val.draw());
    JUDGE_LINE.draw();
    BACK_LANE.forEach(val => val.drawNote());
    drawCombo();

    // showDebugInfo();     // デバッグ用データ描画

    if (TIME.end > TIME.elapsed || !TIME.end) {
        window.requestAnimationFrame(gameLoop);
    } else {
        showResult();
    }
}

// ゲーム内の経過時間と稼働時間を計算
function calcElapsedTime() {
    TIME.elapsedAll = Date.now() - TIME.start;
    TIME.elapsed = TIME.elapsedAll - TIME.stopped;
}

function calcStoppedTime() {
    TIME.stopped = Date.now() - TIME.start - TIME.elapsed;
}

// SEを鳴らす
function playSE(sound) {
    const BUFFER_SOURCE = ACTX.createBufferSource();
    const GAIN = ACTX.createGain();
    GAIN.gain.value = SOUND.seVolume;
    BUFFER_SOURCE.buffer = sound.data;
    BUFFER_SOURCE.connect(GAIN);
    GAIN.connect(ACTX.destination);
    BUFFER_SOURCE.start(0);
}

// イベントを監視する
function eventObserver() {
    //キーが押されたときと押し続けているとき
    document.addEventListener('keydown', e => {
        const TARGET = BACK_LANE.find(val => val.key === e.key);
        if (TARGET && !KEY.status[TARGET.key] && gameActive) {
        TARGET.judge();                                                 // ヒット判定を行う
        }
        if (KEY.pause === e.key && !KEY.status[e.key] && !gameFinish) {
            toggleGame();                                               // ゲームの一時停止を切り替え
        }
        KEY.status[e.key] = true;
    });

    document.addEventListener('keyup', e => KEY.status[e.key] = false); //キーが離された時

    BTN.continue.addEventListener('click', () => toggleGame());
    BTN.restart[0].addEventListener('click', () => gameRestart());
    BTN.restart[1].addEventListener('click', () => gameRestart());

    ELEMENT.BGMSlider.addEventListener('change', () => {
        SOUND.bgmVolume = ELEMENT.BGMSlider.value / 200;
        SOUND.bgm.volume = storage.bgmVolume = SOUND.bgmVolume;
    });

    ELEMENT.SESlider.addEventListener('change', () => {
        SOUND.seVolume = ELEMENT.SESlider.value / 50;
        storage.seVolume = SOUND.seVolume;
    });

    window.addEventListener('blur', () => {
        if (gameActive && !gameFinish) {
            toggleGame();
        }
    });

    window.addEventListener('beforeunload', () => {
        localStorage['Music-Game'] = JSON.stringify(storage);
    });
}

// ゲームの停止状態と稼働状態を切り替える
function toggleGame() {
    if (gameActive) {
        gameActive = false;
        SOUND.bgm.pause();
        document.getElementById('pauseOverlay').style.display = "block";
    } else {
        gameActive = true;
        SOUND.bgm.currentTime = TIME.elapsed / 1000;
        SOUND.bgm.play();
        document.getElementById('pauseOverlay').style.display = "none";
    }
}

// ページはそのままでゲームをリスタートさせる
function gameRestart() {
    for (const key in SCORE) {
        SCORE[key] = 0;
    }
    for (const key in TIME) {
        TIME[key] = 0;
    }
    gameFinish = false;
    toggleGame();
    gameStart();
    document.getElementById('resultOverlay').style.display = "none";
}

// 判定グレードによってスコア処理を行う
function updateGameScore(grade) {
    switch (grade) {
        case 0:
            SCORE.point += 100 + SCORE.combo;
            SCORE.perfect++;
            SCORE.combo++;
            break;
        case 1:
            SCORE.point += 80 + SCORE.combo * 0.8;
            SCORE.great++;
            SCORE.combo++;
            break;
        case 2:
            SCORE.point += 50 + SCORE.combo * 0.5;
            SCORE.good++;
            SCORE.combo++;
            break;
        case 3:
            SCORE.bad++;
            SCORE.combo = 0;
            break;
    }

    if (SCORE.maxCombo < SCORE.combo) {
        SCORE.maxCombo = SCORE.combo;
    }
}

// コンボ数を描画する
function drawCombo() {
    if (SCORE.combo < 2) {
        return;
    }
    CTX.save();
    CTX.beginPath();
    CTX.font = '300px Arial Black';
    CTX.textAlign = 'center';
    CTX.textBaseline = 'middle';
    CTX.fillStyle = 'rgba(255, 204, 0, 0.9)';
    CTX.fillText(SCORE.combo, CANVAS_W / 2, CANVAS_H / 2);
    CTX.restore();
}
