// ローカルストレージの情報を取り出し、反映させる
function importLocalStorage() {
  try {
    storage = JSON.parse(localStorage['Music-Game'] || '{}');
    inputKey.lane = storage.lane ?? inputKey.lane;
    inputKey.pause = storage.pause ?? inputKey.pause;
    note.delay = storage.delay ?? note.delay;
    note.speedRatio = storage.speedRatio ?? note.speedRatio;
    sound.bgmVolume = storage.bgmVolume ?? sound.bgmVolume;
    sound.seVolume = storage.seVolume ?? sound.seVolume;
  } catch (e) {
    window.location.href = '../../index.html';
  }

  let pauseKeyStr;
  if (inputKey.pause === ' ') {
    pauseKeyStr = 'SPACE';
  } else {
    pauseKeyStr = inputKey.pause.toUpperCase();
  }
  document.getElementById('info').textContent = 'Pause : ' + pauseKeyStr;
  element.BGMSlider.value = sound.bgmVolume * 200;
  element.SESlider.value = sound.seVolume * 50;
}

// ゲームの初期化を行う
function gameInit() {
  element.uploadMusicType.addEventListener('change', () => {
    if (element.uploadMusicType.checked) {
      element.uploadMusic.style.display = 'flex';
      element.selectMusic.style.display = 'none';
    } else {
      element.uploadMusic.style.display = 'none';
      element.selectMusic.style.display = 'flex';
    }
  });

  element.uploadCSVType.addEventListener('change', () => {
    if (element.uploadCSVType.checked) {
      element.uploadCSV.style.display = 'flex';
      element.selectCSV.style.display = 'none';
    } else {
      element.uploadCSV.style.display = 'none';
      element.selectCSV.style.display = 'flex';
    }
  });

  element.uploadMusicFile.addEventListener('change', () => {
    element.uploadStr[1].textContent = element.uploadMusicFile.files[0].name;
  });

  element.uploadCSVFile.addEventListener('change', () => {
    element.uploadStr[3].textContent = element.uploadCSVFile.files[0].name;
  });

  CAN.width = CANVAS_W;
  CAN.height = CANVAS_H;
  CTX.lineWidth = LINE_WIDTH;
  CTX.textAlign = 'center';
  CTX.textBaseline = 'middle';

  BACK_LANE.forEach((val, index) => {
    val.key = inputKey.lane[index];
    val.draw();
  });
  JUDGE_LINE.draw();

  // スタートボタンが押されたら発火
  btn.start.addEventListener('click', async () => {
    if ((element.uploadCSVType.checked && !element.uploadCSVFile.files[0])
      || (element.uploadMusicType.checked && !element.uploadMusicFile.files[0])) {
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
  CTX.font = '200px Arial Black';
  CTX.fillStyle = '#e4007f';
  CTX.fillText(DESC_TEXT[0], CANVAS_W / 2, CANVAS_H / 2 - 150);
  CTX.fillText(DESC_TEXT[1], CANVAS_W / 2, CANVAS_H / 2 + 150);
}
