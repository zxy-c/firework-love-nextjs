import {Firework} from "./Firework";
import {Point} from "../utils/BezierUtils";
import RandomUtils from "../utils/RandomUtils";

export default class GameManager {
    prevTime: number = -1
    nextFireTime: number = 2000
    explosionTime: number = 2000
    fireworks: Array<Firework> = []

    touched = false
    touchPoints: Point[] = []
    onLoad?: () => void
    burstBuffer?: AudioBuffer
    fireBuffer?: AudioBuffer
    audioContext = new AudioContext();

    onTouchstart = () => {
        this.touched = true
        this.touchPoints = []
    }

    onTouchend = () => {
        this.touched = false
        for (let firework of this.fireworks) {
            if (firework.consumeTouchPath(this.touchPoints)) {
                break
            }
        }
    }

    onTouchmove = (event: TouchEvent) => {
        event.preventDefault()
        let touch = event.touches.item(0);
        if (touch) {
            this.touchPoints.push([touch.clientX, touch.clientY])
        }

    }

    constructor(private canvas: HTMLCanvasElement) {
        this.requestNextFrame()
        this.canvas.addEventListener("touchstart", this.onTouchstart)
        this.canvas.addEventListener("touchend", this.onTouchend)
        this.canvas.addEventListener("touchmove", this.onTouchmove)
        // 初始化资源
        Promise.all([fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/audio/burst.mp3`)
            .then(value => value.arrayBuffer()).then(value => this.audioContext.decodeAudioData(value)).then(value => {
                this.burstBuffer = value
            }), fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/audio/fire.mp3`).then(value => value.arrayBuffer()).then(value => this.audioContext.decodeAudioData(value)).then(value => this.fireBuffer = value)]).then(() => {
            this.onLoad && this.onLoad()
        })
    }

    computeNextFireTime() {
        this.nextFireTime += RandomUtils.randomNumberFromRange(400, 1200)
    }

    fire() {
        this.fireworks.push(new Firework(this.canvas, this.burstBuffer, this.fireBuffer, this.audioContext))
    }

    update(time: number) {
        const delayTime = this.prevTime === -1 ? 0 : time - this.prevTime
        if (this.nextFireTime <= time) {
            this.fire()
            this.computeNextFireTime()
        }
        let context2D = this.canvas.getContext("2d")!;
        context2D.fillStyle = "black"
        context2D.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.fireworks.forEach(firework => {
            firework.update(delayTime)
        })
        this.prevTime = time
        this.requestNextFrame()
    }

    requestAnimationFrameNumber?: number

    requestNextFrame() {
        this.requestAnimationFrameNumber = window.requestAnimationFrame((time) => this.update(time))
    }

    dispose() {
        this.canvas.removeEventListener("touchstart", this.onTouchstart)
        this.canvas.removeEventListener("touchend", this.onTouchend)
        this.canvas.removeEventListener("touchend", this.onTouchmove)
        if (this.requestAnimationFrameNumber) {
            window.cancelAnimationFrame(this.requestAnimationFrameNumber)
        }
    }
}

