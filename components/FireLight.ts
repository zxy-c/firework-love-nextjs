import {number} from "prop-types";
import RandomUtils from "../utils/RandomUtils";
import ColorUtils from "../utils/ColorUtils";

export default class FireLight{
    static minXSpeed = -8
    static maxXSpeed = 8
    static minYSpeed = 4
    static maxYSpeed = 8
    xSpeed : number
    onDispose?: () => void;
    ySpeed : number

    constructor(private canvas:HTMLCanvasElement, private x:number,private y:number,private readonly color:string,private deadTime:number = 1000) {
        this.xSpeed = RandomUtils.randomNumberFromRange(FireLight.minXSpeed,FireLight.maxXSpeed)
        this.ySpeed = RandomUtils.randomNumberFromRange(FireLight.minYSpeed,FireLight.maxYSpeed)
    }
    update(delayTime:number){
        this.deadTime -= delayTime
        if (this.deadTime<=0){
            this.dispose()
        }else {
            let context2D = this.canvas.getContext("2d")!;
            this.x += this.xSpeed * delayTime/1000
            this.y -= this.ySpeed * delayTime/1000
            context2D.fillStyle = ColorUtils.rgbaWithHexOpacity(this.color,this.deadTime%1)
            context2D.fillRect(this.x,this.y,1,1)
        }
    }
    dispose(){
        this.onDispose&&this.onDispose()
    }
}