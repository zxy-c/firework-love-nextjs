import {Firework} from "./Firework";
import RandomUtils from "../utils/RandomUtils";
import ArrayUtils from "@zxy-cn/array-utils";
import HeartUtils from "../utils/HeartUtils";
import {Point} from "../utils/BezierUtils";

export default class LoveFirework extends Firework{
    getFireFlowerRelativePoints(): Array<Point> {
        const shortBorderSize = Math.min(this.canvas.height,this.canvas.width)
        const heartSize = Math.round(RandomUtils.randomNumberFromRange(shortBorderSize/100,shortBorderSize/50))
        const pointCount  = heartSize * 10
        return ArrayUtils.generate(pointCount,index => {
            let t = index/pointCount * 2 * Math.PI;
            return [HeartUtils.getHeartX(heartSize,t),HeartUtils.getHeartY(heartSize,t)]
        })
    }

}