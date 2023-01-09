import {Firework} from "./Firework";
import {getTextDensePoints} from "../utils/TextPathUtils";
import LoveFirework from "./LoveFirework";
import ArrayUtils from "@zxy-cn/array-utils";
import {Point} from "../utils/BezierUtils";

export default class CharFirework extends Firework{
    constructor(private char:string,offset:number,private fontSize:number,canvas:HTMLCanvasElement,      burstBuffer?: AudioBuffer,
                fireBuffer?: AudioBuffer,
                  audioContext = new AudioContext(),
                 ) {
        super(canvas,burstBuffer,fireBuffer,audioContext)
    }

    getFireFlowerRelativePoints(): Array<Point> {
        return [/*getTextDensePoints(glyph,0,0,this.fontSize)*/]
    }

}