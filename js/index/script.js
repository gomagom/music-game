'use strict';

const SETTING = document.getElementById('btn-setting');
const RETURN = document.getElementById('btn-return');
const RESET = document.getElementById('btn-reset');
const OVERLAY = document.getElementById('Overlay');
const SOUND = {
    bgmVolume: document.getElementById('BGM-slider'),
    seVolume: document.getElementById('SE-slider')
}
const KEY_CONFIG = document.getElementsByClassName('key-config');
const DEFAULT_KEY = ['d', 'f', 'j', 'k', 'p'];
let storage = null;

SETTING.addEventListener('click', () => OVERLAY.style.display = "block");
RETURN.addEventListener('click', () => OVERLAY.style.display = "none");

window.onload = () => {
    try {
        storage = JSON.parse(localStorage['Music-Game'] || '{}');
    } catch(e) {
        storage = {};
    }
    if (storage.lane) {
        storage.lane.forEach((val, index) => {
            KEY_CONFIG[index].textContent = val.toUpperCase();
        });
    }
    if (storage.pause) {
        KEY_CONFIG[4].textContent = storage.pause.toUpperCase();
    }
    if (storage.bgmVolume >= 0) {
        SOUND.bgmVolume.value = storage.bgmVolume * 200;
    }
    if (storage.seVolume >= 0) {
        SOUND.seVolume.value = storage.seVolume * 50;
    }
};

window.onbeforeunload = () => {
    const LANE = [
        KEY_CONFIG[0].textContent.toLowerCase(),
        KEY_CONFIG[1].textContent.toLowerCase(),
        KEY_CONFIG[2].textContent.toLowerCase(),
        KEY_CONFIG[3].textContent.toLowerCase()
    ]
    storage.lane = LANE;
    storage.pause = KEY_CONFIG[4].textContent.toLowerCase();
    storage.bgmVolume = SOUND.bgmVolume.value / 200;
    storage.seVolume = SOUND.seVolume.value / 50;
    localStorage['Music-Game'] = JSON.stringify(storage);
};

RESET.addEventListener('click', () => {
    SOUND.bgmVolume.value = 50;
    SOUND.seVolume.value = 50;
    DEFAULT_KEY.forEach((val, index) => KEY_CONFIG[index].textContent = val.toUpperCase());
});

document.onkeydown = e => {
    for (let i = 0; i < KEY_CONFIG.length; i++) {
        if (KEY_CONFIG[i].textContent === 'ㅤ') {
            if (e.code === 'Space') {
                KEY_CONFIG[i].textContent = e.code.toUpperCase();
            } else {
                KEY_CONFIG[i].textContent = e.key.toUpperCase();
            }
        }
    }
};

for (let i = 0; i < KEY_CONFIG.length; i++) {
    KEY_CONFIG[i].addEventListener('click', () => {
        KEY_CONFIG[i].textContent = 'ㅤ';
    });
}
