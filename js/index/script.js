'use strict';

const SETTING = document.getElementById('btn-setting');
const RETURN = document.getElementById('btn-return');
const RESET = document.getElementById('btn-reset');
const OVERLAY = document.getElementById('Overlay');
const sound = {
  bgmVolume: document.getElementById('BGM-slider'),
  seVolume: document.getElementById('SE-slider')
};
const DELAY = document.getElementById('DELAY-slider');
const SPEED = document.getElementById('SPEED-slider');
const KEY_CONFIG = document.getElementsByClassName('key-config');
const DEFAULT_KEY = ['d', 'f', 'j', 'k', 'p'];
let storage = null;

SETTING.addEventListener('click', () => OVERLAY.style.display = "flex");
RETURN.addEventListener('click', () => OVERLAY.style.display = "none");

window.addEventListener('load', () => {
  try {
    storage = JSON.parse(localStorage['Music-Game'] || '{}');
    if (storage.lane) {
      storage.lane.forEach((val, index) => {
        KEY_CONFIG[index].textContent = val.toUpperCase();
      });
    }
    if (storage.pause) {
      KEY_CONFIG[4].textContent = storage.pause.toUpperCase();
    }
    if (storage.bgmVolume >= 0) {
      sound.bgmVolume.value = storage.bgmVolume * 200;
    }
    if (storage.seVolume >= 0) {
      sound.seVolume.value = storage.seVolume * 50;
    }
    if (storage.delay >= -200) {
      DELAY.value = storage.delay;
    }
    if (storage.speed >= 0) {
      SPEED.value = storage.speed * 100;
    }
  } catch (e) {
    window.location.href = '../../index.html';
  }
});

window.addEventListener('beforeunload', () => {
  storage.lane = [
    KEY_CONFIG[0].textContent.toLowerCase(),
    KEY_CONFIG[1].textContent.toLowerCase(),
    KEY_CONFIG[2].textContent.toLowerCase(),
    KEY_CONFIG[3].textContent.toLowerCase()
  ];
  storage.pause = KEY_CONFIG[4].textContent.toLowerCase();
  storage.bgmVolume = sound.bgmVolume.value / 200;
  storage.seVolume = sound.seVolume.value / 50;
  storage.delay = DELAY.value - 0;
  storage.speed = SPEED.value / 100;
  localStorage['Music-Game'] = JSON.stringify(storage);
});

RESET.addEventListener('click', () => {
  sound.bgmVolume.value = 50;
  sound.seVolume.value = 50;
  DELAY.value = 0;
  SPEED.value = 100;
  DEFAULT_KEY.forEach((val, index) => KEY_CONFIG[index].textContent = val.toUpperCase());
});

document.addEventListener('keydown', e => {
  for (let i = 0; i < KEY_CONFIG.length; i++) {
    if (KEY_CONFIG[i].textContent === 'ㅤ') {
      if (e.code === 'Space') {
        KEY_CONFIG[i].textContent = e.code.toUpperCase();
      } else {
        KEY_CONFIG[i].textContent = e.key.toUpperCase();
      }
    }
  }
});

for (let i = 0; i < KEY_CONFIG.length; i++) {
  KEY_CONFIG[i].addEventListener('click', () => {
    KEY_CONFIG[i].textContent = 'ㅤ';
  });
}
