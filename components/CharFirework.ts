import {Firework} from "./Firework";
import {getTextDensePoints} from "../utils/TextPathUtils";
import LoveFirework from "./LoveFirework";
import ArrayUtils from "@zxy-cn/array-utils";
import {Point} from "../utils/BezierUtils";
import {Glyph} from "opentype.js";

export default class CharFirework extends Firework {

    yOffset = 0
    xOffset = 0

    constructor(private glyph: Glyph,textMetrics:TextMetrics, offset: number, private fontSize: number, canvas: HTMLCanvasElement, burstBuffer?: AudioBuffer,
                fireBuffer?: AudioBuffer,
                audioContext = new AudioContext(),
    ) {

        super(canvas, burstBuffer, fireBuffer, audioContext)
        this.xOffset = -textMetrics.width / 2
        this.yOffset = (textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent) / 2
        this.yDeceleration = 0
        this.explodeCountdown = Firework.minExplodeCountdown
        this.x = offset
    }

    getFireFlowerRelativePoints(): Array<Point> {
        return getTextDensePoints(this.glyph, 0, 0, this.fontSize).map(([x, y]) => [x + this.xOffset, y + this.yOffset])
    }

}