import {Firework} from "./Firework";
import {Point} from "../utils/BezierUtils";
import RandomUtils from "../utils/RandomUtils";
import TouchLove from "./TouchLove";
import ArrayUtils from "@zxy-cn/array-utils";
import opentype, {Font} from "opentype.js"

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

    touchLoves: Array<TouchLove> = []

    private activeFireworkCountdown = 5

    texts: Array<string> = ["2023", "新年快乐"]

    font ?: Font;

    get quickFire() {
        return this.activeFireworkCountdown <= 0
    }

    private quickFireTime = 10000

    constructor(private canvas: HTMLCanvasElement) {
        this.canvas.addEventListener("mousedown", this.onTouchstart)
        this.canvas.addEventListener("mouseup", this.onTouchend)
        this.canvas.addEventListener("mousemove", this.onMousemove)
        this.canvas.addEventListener("touchstart", this.onTouchstart)
        this.canvas.addEventListener("touchend", this.onTouchend)
        this.canvas.addEventListener("touchmove", this.onTouchmove)
        // 初始化资源
        Promise.all([fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/audio/burst.mp3`)
            .then(value => value.arrayBuffer()).then(value => this.audioContext.decodeAudioData(value)).then(value => {
                this.burstBuffer = value
            }), fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/audio/fire.mp3`)
            .then(value => value.arrayBuffer())
            .then(value => this.audioContext.decodeAudioData(value))
            .then(value => this.fireBuffer = value),
            new Promise<Font | undefined>((resolve, reject) => {
                opentype.load(`${process.env.NEXT_PUBLIC_BASE_PATH}/fonts/华文楷体.ttf`, (error, font) => {
                    if (error) {
                        console.error(error)
                        reject(error)
                    } else {
                        resolve(font)
                    }
                })
            }).then(value => this.font = value)])
            .then(() => {
                this.onLoad && this.onLoad()
                this.requestNextFrame()
            })
    }

    onTouchstart = () => {
        this.touched = true
        this.touchPoints = []
    }

    onMousemove = (event: MouseEvent) => {
        event.preventDefault()
        if (this.touched) {
            this.addTouchLove(event.x, event.y)
        }
    }

    addTouchLove(x: number, y: number) {
        this.touchPoints.push([x, y])
        let touchLove = new TouchLove(this.canvas, x, y);
        touchLove.onDispose = () => {
            ArrayUtils.remove(this.touchLoves, touchLove)
        }
        this.touchLoves.push(touchLove)
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
            this.addTouchLove(touch.clientX, touch.clientY)
        }
    }

    computeNextFireTime() {
        this.nextFireTime += RandomUtils.randomNumberFromRange(400, 1200)
    }

    computeNextQuickFireTime() {
        this.nextFireTime += RandomUtils.randomNumberFromRange(100, 200)
    }

    fire() {
        let firework = new Firework(this.canvas, this.burstBuffer, this.fireBuffer, this.audioContext);
        firework.onActive = () => {
            this.activeFireworkCountdown -= 1
        }
        this.fireworks.push(firework)
    }

    update(time: number) {
        const delayTime = this.prevTime === -1 ? 0 : time - this.prevTime
        if (this.quickFire) {
            this.quickFireTime -= delayTime
        } else if (this.quickFireTime >= 0) {
            // 文字展出

        }
        if (this.nextFireTime <= time) {
            if (this.quickFire && this.quickFireTime >= 0) {
                ArrayUtils.generate(Math.round(RandomUtils.randomNumberFromRange(1, 3)), index => {
                    this.fire()
                })
                this.computeNextQuickFireTime()
            } else {
                this.fire()
                this.computeNextFireTime()
            }
        }
        let context2D = this.canvas.getContext("2d")!;
        context2D.fillStyle = "black"
        context2D.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.fireworks.forEach(firework => {
            firework.update(delayTime)
        })
        this.touchLoves.forEach(touchLove => {
            touchLove.update(delayTime)
        })
        this.prevTime = time
        this.requestNextFrame()
    }

    requestAnimationFrameNumber?: number

    requestNextFrame() {
        this.requestAnimationFrameNumber = window.requestAnimationFrame((time) => this.update(time))
    }

    dispose() {
        this.canvas.removeEventListener("mousedown", this.onTouchstart)
        this.canvas.removeEventListener("mouseup", this.onTouchend)
        this.canvas.removeEventListener("mousemove", this.onMousemove)
        this.canvas.removeEventListener("touchstart", this.onTouchstart)
        this.canvas.removeEventListener("touchend", this.onTouchend)
        this.canvas.removeEventListener("touchend", this.onTouchmove)
        if (this.requestAnimationFrameNumber) {
            window.cancelAnimationFrame(this.requestAnimationFrameNumber)
        }
    }
}

