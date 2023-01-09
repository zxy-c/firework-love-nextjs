import {Point} from "../utils/BezierUtils";
import FireLight from "./FireLight";
import RandomUtils from "../utils/RandomUtils";
import ArrayUtils from "@zxy-cn/array-utils";
import {types} from "sass";
import Color = types.Color;
import ColorUtils from "../utils/ColorUtils";

export default class FireFlower {
    yDeceleration: number
    xDeceleration: number
    xSpeed: number
    ySpeed: number
    onDispose?:()=>void

    radius = 1

    stopTime: number = 2
    fireLights:FireLight[] = []
    nextFireLightCountdown:number = 20
    static fireLightGenerateRadius = 5
    deadTime:number = 4
    active = false
    get keepTime(){
        return this.deadTime - this.stopTime
    }

    get dead():boolean{
        return this.deadTime <= 0
    }

    constructor(private canvas: HTMLCanvasElement,   public color: string, public x: number,public y: number, private destinationX: number,private destinationY: number) {
        this.yDeceleration = -this.canvas.height / 50
        this.xDeceleration = -this.canvas.width / 50
         if (destinationX === x){
            this.xSpeed=0
        }else {
            this.xSpeed = (Math.abs(destinationX - x) - this.xDeceleration * Math.pow(this.stopTime, 2) / 2) / this.stopTime /** (destinationX>= x?1:-1)*/
            // this.xSpeed = (destinationX - x) /this.deadTime
        }
        if (destinationY === y ){
            this.ySpeed = 0
        }else {
            this.ySpeed = (Math.abs(destinationY - y) - this.yDeceleration * Math.pow(this.stopTime, 2) / 2) / this.stopTime /** (destinationY>= y ?1:-1)*/
            // this.ySpeed = (destinationY - y) /this.deadTime
        }
        // console.error(this.xSpeed,destinationX,x,this.xDeceleration,this.deadTime,Math.abs(destinationX - x),Math.abs(destinationY - x) - this.yDeceleration * Math.pow(this.deadTime, 2) / 2 )
    }

    update(delayTime:number){
        const delayTimeSeconds = delayTime/1000
        if (!this.active){
            this.stopTime -= delayTimeSeconds
            this.deadTime -= delayTimeSeconds
        }

        this.nextFireLightCountdown -= delayTime
        if (this.nextFireLightCountdown<=0){
            let fireLight =new FireLight(this.canvas,RandomUtils.randomNumberFromRange(this.x-FireFlower.fireLightGenerateRadius,this.x + FireFlower.fireLightGenerateRadius),RandomUtils.randomNumberFromRange(this.y-FireFlower.fireLightGenerateRadius,this.y + FireFlower.fireLightGenerateRadius),this.color,200);
            fireLight.onDispose = ()=>{
                ArrayUtils.remove(this.fireLights,fireLight)
            }
            this.fireLights.push(fireLight)
            this.nextFireLightCountdown = 20
        }
        if (this.deadTime<=0){
            this.dispose()
        }else {
            let alpha = Math.max(Math.min(this.deadTime / this.keepTime,1),.2)
            if (this.stopTime>0 && !this.active){
                this.x += (this.xSpeed*delayTimeSeconds + this.xDeceleration*Math.pow(delayTimeSeconds,2)/2) * (this.destinationX>= this.x?1:-1)
                this.y += (this.ySpeed*delayTimeSeconds + this.yDeceleration*Math.pow(delayTimeSeconds,2)/2)* (this.destinationY>= this.y?1:-1)
                this.xSpeed = Math.max(this.xSpeed + delayTimeSeconds * this.xDeceleration,0)
                this.ySpeed = Math.max(this.ySpeed + delayTimeSeconds * this.yDeceleration,0)
            }

            let context2D = this.canvas.getContext("2d")!;
            context2D.beginPath()
            context2D.arc(this.x,this.y,this.radius,0,Math.PI*2)
            context2D.fillStyle = ColorUtils.rgbaWithHexOpacity(this.color,alpha)
            context2D.fill()
        }
        for (let fireLight of this.fireLights) {
            fireLight.update(delayTime)
        }

    }

    dispose(){
        this.onDispose&&this.onDispose()
    }

}