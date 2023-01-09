import RandomUtils from "../utils/RandomUtils";
import ColorUtils from "../utils/ColorUtils";
import FireLight from "./FireLight";
import ArrayUtils from "@zxy-cn/array-utils";
import FireFlower from "./FireFlower";
import HeartUtils from "../utils/HeartUtils";
import {Point} from "../utils/BezierUtils";

export abstract class Firework{

    static maxYInitialSpeed = 4.5
    static minYInitialSpeed = 3.5

    static maxYDeceleration = 10
    static minYDeceleration =7
    static maxExplodeCountdown = 4000
    static minExplodeCountdown = 3000

    ySpeed :number
    x:number
    radius = 1
    yDeceleration:number
    y:number
    explodeCountdown:number
    exploded = false
    color:string
    static fireLightGenerateRadius = 3
    nextFireLightCountdown = 50
    fireLights:Array<FireLight> = []
    fireFlowers:Array<FireFlower> = []
    static selectableColors = ["#FF5252","#FF4081","#E040FB","#7C4DFF","#536DFE","#448AFF","#40C4FF","#18FFFF","#64FFDA","#69F0AE","#B2FF59","#EEFF41","#FFFF00","#FFD740","#FFAB40"]
    lightTime:number = Firework.initialLightTime
    static initialLightTime = 1000

    onActive?:()=>void

    onDispose?:()=>void

    constructor(protected canvas:HTMLCanvasElement, private     burstBuffer?: AudioBuffer,
                fireBuffer?: AudioBuffer,
                private audioContext = new AudioContext(),) {
        if (fireBuffer!=null){
            const bufferSource = this.audioContext.createBufferSource();
            // bufferSource.playbackRate.value = scaledPlaybackRate;
            bufferSource.buffer = fireBuffer;
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 1;
            bufferSource.connect(gainNode).connect(this.audioContext.destination);
            bufferSource.start(0);
        }
        const xFireOffset = canvas.width * 0.1
        this.ySpeed = canvas.height/RandomUtils.randomNumberFromRange(Firework.minYInitialSpeed,Firework.maxYInitialSpeed)
        this.yDeceleration = this.ySpeed/RandomUtils.randomNumberFromRange(3,5)
        this.y = canvas.height
        this.x = RandomUtils.randomNumberFromRange(xFireOffset,canvas.width - xFireOffset);
        this.explodeCountdown = RandomUtils.randomNumberFromRange(Firework.minExplodeCountdown,Firework.maxExplodeCountdown)
        this.color=RandomUtils.randomItemFromArray(Firework.selectableColors)
    }

    update(delayTime:number){
        let context2D = this.canvas.getContext("2d")!;
        if(this.exploded){
            this.lightTime -= delayTime
            if (!this.fireFlowers.some(it=>!it.dead)){
                this.onDispose && this.onDispose()
            }else if (this.lightTime>=0){
                let canvasGradient = context2D.createRadialGradient(this.x,this.y,0,this.x,this.y,Math.max(Math.abs(this.x),Math.abs(this.y)));
                canvasGradient.addColorStop(0,ColorUtils.rgbaWithHexOpacity(this.color,this.lightTime/Firework.initialLightTime * 0.1))
                canvasGradient.addColorStop(1,"rgba(255,255,255,0)")
                context2D.fillStyle = /*ColorUtils.rgbaWithHexOpacity(this.color,this.lightTime/Firework.initialLightTime * 0.1)*/canvasGradient
                context2D.globalCompositeOperation="lighter"
                context2D.fillRect(0,0,this.canvas.width,this.canvas.height)
                context2D.globalCompositeOperation = "source-over"
            }
        }else if (this.explodeCountdown<=0){
            this.exploded = true
            if (this.burstBuffer){

                const bufferSource = this.audioContext.createBufferSource();
                // bufferSource.playbackRate.value = scaledPlaybackRate;
                bufferSource.buffer = this.burstBuffer;
                const gainNode = this.audioContext.createGain();
                gainNode.gain.value = 1;
                bufferSource.connect(gainNode).connect(this.audioContext.destination);
                bufferSource.start(0);
            }
            this.getFireFlowerRelativePoints().forEach(([x,y])=>{
                let fireFlower = new FireFlower(this.canvas,this.color,this.x,this.y,this.x+x,this.y+y);
                fireFlower.onDispose = ()=>{
                    ArrayUtils.remove(this.fireFlowers,fireFlower)
                }
                this.fireFlowers.push(fireFlower)
            })


        } else {
            this.explodeCountdown-=delayTime
            this.nextFireLightCountdown -= delayTime
            if (this.nextFireLightCountdown<=0){
                let fireLight =new FireLight(this.canvas,RandomUtils.randomNumberFromRange(this.x-Firework.fireLightGenerateRadius,this.x + Firework.fireLightGenerateRadius),this.y,this.color);
                fireLight.onDispose = ()=>{
                    ArrayUtils.remove(this.fireLights,fireLight)
                }
                this.fireLights.push(fireLight)
            }


            context2D.beginPath()
            this.ySpeed = this.ySpeed - this.yDeceleration * delayTime/1000;
            this.y = this.y - delayTime/1000 * Math.max(this.ySpeed,0);
            context2D.arc(this.x,this.y,this.radius,0,Math.PI * 2)
            let mainRadialGradient = context2D.createRadialGradient(this.x,this.y,0,this.x,this.y,this.radius);
            mainRadialGradient.addColorStop(0,this.color)
            mainRadialGradient.addColorStop(1,ColorUtils.rgbaWithHexOpacity(this.color,0.2))
            context2D.fillStyle = mainRadialGradient
            context2D.fill()
            // 拖尾
            context2D.moveTo(this.x,this.y)
            let tailYDiff = this.ySpeed * 0.2;
            let tailY = this.y + tailYDiff;
            let tailRadialGradient = context2D.createRadialGradient(this.x,this.y,0,this.x,this.y,Math.max(tailYDiff,0));
            tailRadialGradient.addColorStop(0,ColorUtils.rgbaWithHexOpacity(this.color,RandomUtils.randomNumberFromRange(0.2,1)))
            tailRadialGradient.addColorStop(1,"rgba(255,255,255,0)")
            context2D.strokeStyle = tailRadialGradient
            context2D.lineWidth = 1
            context2D.lineTo(this.x,tailY)
            context2D.stroke()
        }
        for (let fireLight of this.fireLights) {
            fireLight.update(delayTime)
        }
        for (let fireFlower of this.fireFlowers) {
            fireFlower.update(delayTime)
        }
    }

    consumeTouchPath(points:Point[]):boolean{
        if (this.fireFlowers.some(it=>it.stopTime<=0)){
            let context2D = this.canvas.getContext("2d")!;
            context2D.lineWidth = 8
            let path2D = new Path2D();
            path2D.moveTo(this.fireFlowers[0].x,this.fireFlowers[0].y)
            for (let fireFlower of this.fireFlowers) {
                path2D.lineTo(fireFlower.x,fireFlower.y)
            }
            path2D.closePath()
            let rightPoints = points.filter(point=>context2D.isPointInStroke(path2D,point[0],point[1])).length;
            if (rightPoints>=points.length/3){
                for (let fireFlower of this.fireFlowers) {
                    fireFlower.active=true
                }
                context2D.closePath()
                this.onActive && this.onActive()
                return true
            }else {
                context2D.closePath()
            }


        }

        return false
    }

    abstract  getFireFlowerRelativePoints():Array<Point>


}