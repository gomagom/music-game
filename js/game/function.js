function checkHit(hitTime, range) {
    if (Math.abs(elapsedTime - hitTime) <= range) {
        return true;
    } else {
        return false;
    }
}

function calcElapsedTime() {
    elapsedTimeAll = Date.now() - startTime;
    elapsedTime = elapsedTimeAll - stoppedTime;
}

function 
