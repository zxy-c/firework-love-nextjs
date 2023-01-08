import ArrayUtils from "@zxy-cn/array-utils";
import HeartUtils from "../utils/HeartUtils";
import ColorUtils from "../utils/ColorUtils";

export default class TouchLove{

    static initialDeadTime:number = 800
    deadTime:number = TouchLove.initialDeadTime

    onDispose?:()=>void
    private heartSize: number;
    constructor(private canvas:HTMLCanvasElement,private readonly x:number,private readonly y:number) {
        this.heartSize = Math.min(this.canvas.height,this.canvas.height)/2000
    }
    update(delayTime:number,){
        this.deadTime -= delayTime
        if (this.deadTime<=0){
            this.dispose()
        }else {
            const pointCount = 50
            let context2D = this.canvas.getContext("2d")!;
            context2D.beginPath()
            ArrayUtils.generate(pointCount,index => {
                let angle = index/pointCount * 2 * Math.PI;
                let heartX = HeartUtils.getHeartX(this.heartSize,angle);
                let heartY = HeartUtils.getHeartY(this.heartSize,angle);
                return {x:this.x+heartX,y:this.y+heartY}
            }).forEach((value, index) => {
                if (index===0){
                    context2D.moveTo(value.x,value.y)
                }else {
                    context2D.lineTo(value.x,value.y)
                }
            })
            context2D.closePath()
            context2D.strokeStyle = ColorUtils.rgbaWithHexOpacity("#FF4081",Math.max(this.deadTime/TouchLove.initialDeadTime,0))
            context2D.stroke()
        }
    }
    dispose(){
        this.onDispose && this.onDispose()
    }
}