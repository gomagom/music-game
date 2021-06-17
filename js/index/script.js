'use strict';

const SETTING = document.getElementById('btn-setting');
const RETURN = document.getElementById('btn-return');
const OVERLAY = document.getElementById('Overlay');
const BGM_VOLUME = document.getElementById('BGM-slider');
const SE_VOLUME = document.getElementById('SE-slider');
let storage = null;

SETTING.addEventListener('click', () => OVERLAY.style.display = "block");
RETURN.addEventListener('click', () => OVERLAY.style.display = "none");

window.onload = () => {
    try {
        storage = JSON.parse(localStorage['Music-Game'] || '{}');
    } catch(e) {
        storage = {};
    }
    if (storage.bgmVolume >= 0) {
        BGM_VOLUME.value = storage.bgmVolume * 200;
    }
    if (storage.seVolume >= 0) {
        SE_VOLUME.value = storage.seVolume * 50;
    }
};

window.onbeforeunload = () => {
    localStorage['Music-Game'] = JSON.stringify(storage);
};

BGM_VOLUME.onchange = () => storage.bgmVolume = BGM_VOLUME.value / 200;
SE_VOLUME.onchange = () => storage.seVolume = SE_VOLUME.value / 50;
