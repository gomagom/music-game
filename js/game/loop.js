// 画面のリフレッシュレートに合わせてループ処理
function gameLoop() {
  if (gameActive) {
    calcElapsedTime();
  } else {
    calcStoppedTime();
  }

  BACK_LANE.forEach(val => val.update());
  drawOnCanvas();
  loopReq = window.requestAnimationFrame(gameLoop);

  showResult();
}

// 描画を管理
function drawOnCanvas() {
  CTX.clearRect(0, 0, CANVAS_W, CANVAS_H);
  BACK_LANE.forEach(val => val.draw());
  JUDGE_LINE.draw();
  BACK_LANE.forEach(val => val.drawNote());
  drawCombo();
}

// コンボ数を描画する
function drawCombo() {
  if (gameScore.combo < 2) {
    return;
  }
  CTX.save();
  CTX.beginPath();
  CTX.font = '300px Arial Black';
  CTX.textAlign = 'center';
  CTX.textBaseline = 'middle';
  CTX.fillStyle = 'rgba(255, 204, 0, 0.9)';
  CTX.fillText(gameScore.combo, CANVAS_W / 2, CANVAS_H / 2);
  CTX.restore();
}

// ゲーム内の経過時間と稼働時間を計算
function calcElapsedTime() {
  time.elapsedAll = Date.now() - time.start;
  time.elapsed = time.elapsedAll - time.stopped;  // 経過時間には停止時間を含まない
}

// ゲームの合計停止時間を計算
function calcStoppedTime() {
  time.stopped = Date.now() - time.start - time.elapsed;
}

// イベントを監視する
function eventObserver() {
  //キーが押されたときと押し続けているとき
  document.addEventListener('keydown', e => {
    const TARGET = BACK_LANE.find(val => val.key === e.key);
    if (TARGET && !inputKey.status[TARGET.key] && gameActive) {
      TARGET.judge();                                             // ヒット判定を行う
    }
    if (inputKey.pause === e.key && !inputKey.status[e.key] && !gameFinish) {
      toggleGame();                                               // ゲームの一時停止を切り替え
    }
    inputKey.status[e.key] = true;
  });

  document.addEventListener('keyup', e => inputKey.status[e.key] = false); //キーが離された時

  btn.continue.addEventListener('click', toggleGame);
  btn.restart[0].addEventListener('click', gameRestart);
  btn.restart[1].addEventListener('click', gameRestart);

  element.BGMSlider.addEventListener('change', () => {
    sound.bgmVolume = element.BGMSlider.value / 200;
    sound.bgm.volume = storage.bgmVolume = sound.bgmVolume;
  });

  element.SESlider.addEventListener('change', () => {
    sound.seVolume = element.SESlider.value / 50;
    storage.seVolume = sound.seVolume;
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
    sound.bgm.pause();
    document.getElementById('pauseOverlay').style.display = "block";
  } else {
    gameActive = true;
    sound.bgm.currentTime = time.elapsed / 1000;
    sound.bgm.play();
    document.getElementById('pauseOverlay').style.display = "none";
  }
}

// ページはそのままでゲームをリスタートさせる
function gameRestart() {
  cancelAnimationFrame(loopReq);
  for (const key in time) {
    if (key != 'end') {
      time[key] = 0;
    }
  }
  gameScore.reset();
  JUDGE_LINE.reset();
  sound.bgm.pause();
  gameFinish = true;
  document.getElementById('pauseOverlay').style.display = "none";
  document.getElementById('resultOverlay').style.display = "none";
  gameStart();
}
