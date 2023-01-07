import ArrayUtils from "@zxy-cn/array-utils";

export type Point = [number,number]
function getTwoOrderBezierPoint(t:number, p1:Point, cp:Point, p2:Point):Point {
    let [x1, y1] = p1,
        [cx, cy] = cp,
        [x2, y2] = p2;
    const x = (1 - t) * (1 - t) * x1 + 2 * t * (1 - t) * cx + t * t * x2,
        y = (1 - t) * (1 - t) * y1 + 2 * t * (1 - t) * cy + t * t * y2;
    return [x, y];
}
function getThreeOrderBezierPoint(t:number, p1:Point, cp1:Point, cp2:Point, p2:Point):Point {
    let [x1, y1] = p1,
        [cx1, cy1] = cp1,
        [cx2, cy2] = cp2,
        [x2, y2] = p2;
    const x =
        x1 * (1 - t) * (1 - t) * (1 - t) +
        3 * cx1 * t * (1 - t) * (1 - t) +
        3 * cx2 * t * t * (1 - t) +
        x2 * t * t * t;
    const y =
        y1 * (1 - t) * (1 - t) * (1 - t) +
        3 * cy1 * t * (1 - t) * (1 - t) +
        3 * cy2 * t * t * (1 - t) +
        y2 * t * t * t;
    return [x, y];
}

function getThreeOrderBezierLength( p1:Point, cp1:Point, cp2:Point, p2:Point):number{
    let points = ArrayUtils.generate(101, index => 0.01 * index)
        .map(it=>getThreeOrderBezierPoint(it,p1,cp1,cp2,p2));
    let length = 0
    for (let i = 0; i < points.length-1; i++) {
        length += computeDistanceBetweenTwoPoints(points[i],points[i+1])
    }
    return length
}

function getTwoOrderBezierLength(  p1:Point, cp:Point, p2:Point):number{
    let points = ArrayUtils.generate(101, index => 0.01 * index)
        .map(it=>getTwoOrderBezierPoint(it,p1,cp,p2));
    console.error(points)
    let length = 0
    for (let i = 0; i < points.length-1; i++) {
        length += computeDistanceBetweenTwoPoints(points[i],points[i+1])
    }
    return length
}


function computeDistanceBetweenTwoPoints(p1:Point,p2:Point){
    const [x1,y1] = p1
    const [x2,y2] = p2
    if (y1 === y2){
        return Math.abs(x1 - x2)
    }
    return Math.sqrt(Math.pow(y1 - y2,2) + Math.pow(x1-x2,2))
}

export default {
    getThreeOrderBezierLength,
    getTwoOrderBezierLength,
    getThreeOrderBezierPoint,
    getTwoOrderBezierPoint
}

