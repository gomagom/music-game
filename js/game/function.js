function getLanePosition(laneNo) {
    return (CANVAS_W - LANE.width * 4 - LANE.margin * 3 + LANE.width) / 2 + (LANE.width + LANE.margin) * laneNo;
}

function getLaneKey(laneNo) {
    const key = ['d', 'f', 'j', 'k'];
    return key[laneNo];
}