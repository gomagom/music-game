'use strict';

const SETTING = document.getElementById('btn-setting');
const RETURN = document.getElementById('btn-return');
const OVERLAY = document.getElementById('Overlay');
const SOUND = {
    bgmVolume: document.getElementById('BGM-slider'),
    seVolume: document.getElementById('BGM-slider')
}
const KEY_CONFIG = document.getElementsByClassName('key-config');
let storage = null;

SETTING.addEventListener('click', () => OVERLAY.style.display = "block");
RETURN.addEventListener('click', () => OVERLAY.style.display = "none");

window.onload = () => {
    try {
        storage = JSON.parse(localStorage['Music-Game'] || '{}');
    } catch(e) {
        storage = {};
    }
    console.log(storage);
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
    localStorage['Music-Game'] = JSON.stringify(storage);
};


SOUND.bgmVolume.onchange = () => storage.bgmVolume = SOUND.bgmVolume.value / 200;
SOUND.seVolume.onchange = () => storage.seVolume = SOUND.seVolume.value / 50;

for (let i = 0; i < KEY_CONFIG.length; i++) {
    KEY_CONFIG[i].addEventListener('click', () => {
        KEY_CONFIG[i].textContent = 'ㅤ';
    });
}

document.onkeydown = e => {
    for (let i = 0; i < KEY_CONFIG.length; i++) {
        if (KEY_CONFIG[i].textContent === 'ㅤ') {
            KEY_CONFIG[i].textContent = e.key.toUpperCase();
        }
    }
};
