function getHeartX(size:number,t:number){  //获取心型线的X坐标
    return size*(16 * Math.pow(Math.sin(t),3))
}

function getHeartY(size:number,t:number){  //获取心型线的Y坐标
    return -size*(13 * Math.cos(t) - 5 * Math.cos(2 * t) -2 * Math.cos(3 * t)- Math.cos(4 * t))
}

export default {
    getHeartX,
    getHeartY
}