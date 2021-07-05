// ゲームの初期化を行う
function gameInit() {
  element.uploadMusicFile.addEventListener('change', () => {
    element.uploadStr[1].textContent = element.uploadMusicFile.files[0].name;
  });
  element.uploadCSVFile.addEventListener('change', () => {
    element.uploadStr[3].textContent = element.uploadCSVFile.files[0].name;
  });

  try {
    storage = JSON.parse(localStorage['Music-Game'] || '{}');
    for (const key in storage) {
      if (key === 'lane') {
        inputKey[key] = storage[key];
      } else if (key === 'pause') {
        inputKey[key] = storage[key];
      } else {
        sound[key] = storage[key];
      }
    }
  } catch (e) {
    window.location.href = '../../index.html';
  }

  document.getElementById('info').textContent = `Pause : ${inputKey.pause.toUpperCase()}`;
  element.BGMSlider.value = sound.bgmVolume * 200;
  element.SESlider.value = sound.seVolume * 50;

  CAN.width = CANVAS_W;
  CAN.height = CANVAS_H;
  CTX.lineWidth = LINE_WIDTH;

  BACK_LANE.forEach(val => val.draw());
  JUDGE_LINE.draw();

  // スタートボタンが押されたら発火
  btn.start.addEventListener('click', async () => {
    if ((element.uploadCSV.checked && !element.uploadCSVFile.files[0])
      || (element.uploadMusic.checked && !element.uploadMusicFile.files[0])) {
      alert('ファイルを選択してください');
      return;
    }
    await musicalScore.prepareScore();
    await sound.prepareFile();
    eventObserver();
    gameStart();
    element.startOverlay.style.display = "none";
  });
}

// 必要なデータを準備し、ゲームループを開始
function gameStart() {
  musicalScore.setScore();
  drawOnCanvas();
  drawDesc();
  document.addEventListener('keydown', () => {  // いずれかのキーを押下してゲームを開始
    gameActive = true;
    gameFinish = false;
    sound.bgm.currentTime = 0;
    sound.bgm.play();
    time.start = Date.now();
    loopReq = window.requestAnimationFrame(gameLoop);
  }, {
    once: true
  });
}

// ゲーム開始時の説明文を表示
function drawDesc() {
  const DESC_TEXT = ['Press any key', 'to start'];
  CTX.save();
  CTX.font = '200px Arial Black';
  CTX.fillStyle = '#e4007f';
  CTX.textAlign = 'center';
  CTX.textBaseline = 'middle';
  CTX.fillText(DESC_TEXT[0], CANVAS_W / 2, CANVAS_H / 2 - 150);
  CTX.fillText(DESC_TEXT[1], CANVAS_W / 2, CANVAS_H / 2 + 150);
  CTX.restore();
}
