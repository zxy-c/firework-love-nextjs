import {Firework} from "./Firework";
import {Point} from "../utils/BezierUtils";
import RandomUtils from "../utils/RandomUtils";
import TouchLove from "./TouchLove";
import ArrayUtils from "@zxy-cn/array-utils";
import opentype, {Font} from "opentype.js"
import LoveFirework from "./LoveFirework";
import CharFirework from "./CharFirework";

const qs = require('qs');

export default class GameManager {
    prevTime: number = -1
    /**
     * 下一次开火的时间
     */
    nextFireTime: number = 1000
    /**
     * 烟花
     */
    fireworks: Array<Firework> = []
    /**
     * 触摸状态
     */
    touched = false
    /**
     * 触摸的路径点
     */
    touchPoints: Point[] = []
    onLoad?: () => void
    burstBuffer?: AudioBuffer
    fireBuffer?: AudioBuffer
    audioContext = new AudioContext();

    /**
     * 触摸所带的爱心
     */
    touchLoves: Array<TouchLove> = []

    /**
     * 需要激活的烟花的数量
     */
    private activeFireworkCountdown = 5

    /**
     * 展示的文字
     */
    texts: Array<string>

    /**
     * 当前展示的文字的索引
     */
    currentTextIndex: number = -1
    /**
     * 展示完一排文字后
     * 下一次展示的时间
     */
    static initialNextTextIndexTime: number = 6000
    nextTextIndexTime = 0

    font ?: Font;

    get quickFire() {
        return this.activeFireworkCountdown <= 0
    }

    /**
     * 快速开火所持续的时间
     */
    private quickFireTime = 10000

    /**
     * 快速连续烟花结束后，展示文字之前延迟的时间
     */
    static textShowDelay: number = 4000

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
                opentype.load(`https://static-1302893210.cos.ap-shanghai.myqcloud.com/%E5%8D%8E%E6%96%87%E6%A5%B7%E4%BD%93.ttf`, (error, font) => {
                    if (error) {
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

        let query = qs.parse(location.search.replace("?",""));
        let textList = query.textList;
        if (textList && typeof textList === "string"){
            this.texts = textList.split(",")
        }else {
            this.texts = [new Date().getFullYear().toString(), "新年快乐", "大展宏兔"]
        }


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
        let firework = new LoveFirework(this.canvas, this.burstBuffer, this.fireBuffer, this.audioContext);
        firework.onDispose = () => {
            ArrayUtils.remove(this.fireworks, firework)
        }
        firework.onActive = () => {
            this.activeFireworkCountdown -= 1
        }
        this.fireworks.push(firework)
    }

    update(time: number) {
        let context2D = this.canvas.getContext("2d")!;
        const delayTime = this.prevTime === -1 ? 0 : time - this.prevTime
        if (this.quickFire) {
            this.quickFireTime -= delayTime
        }
        if (this.quickFireTime <= 0) {
            this.fireworks.forEach(firework => {
                firework.fireFlowers.forEach(fireFlower => {
                    fireFlower.active = false
                })
            })
            if (this.quickFireTime + GameManager.textShowDelay <= 0) {
                // 文字展出
                if (this.texts.length >= 0) {
                    if (this.nextTextIndexTime <= 0) {
                        this.nextTextIndexTime = GameManager.initialNextTextIndexTime
                        this.currentTextIndex += 1
                        let width = this.canvas.width;
                        const fontSize = width / 6
                        context2D.font = `${fontSize}px hwxk`
                        let text = this.texts[this.currentTextIndex];
                        const textSpacing = width / 24
                        if (text && this.font != null) {
                            const charArray = Array.from(text)
                            let textMetrics = charArray.map(char => context2D.measureText(char));
                            const computeTextWidth = (textMetric: TextMetrics) => {
                                // if (this.canvas.height>this.canvas.width){
                                //     return textMetric.actualBoundingBoxAscent + textMetric.actualBoundingBoxDescent
                                // }else {
                                return textMetric.width
                                // }
                            }
                            const textBoxWidth = (text.length - 1) * textSpacing + ArrayUtils.sum(textMetrics.map(it => {
                                return computeTextWidth(it)
                            }))
                            let offset = (width - textBoxWidth) / 2
                            for (let i = 0; i < text.length; i++) {
                                let glyph = this.font?.charToGlyph(text.charAt(i));
                                if (glyph) {
                                    let charFirework = new CharFirework(glyph, textMetrics[i], offset, fontSize, this.canvas, this.burstBuffer, this.fireBuffer, this.audioContext);
                                    charFirework.onDispose = () => {
                                        ArrayUtils.remove(this.fireworks, charFirework)
                                    }
                                    this.fireworks.push(charFirework)
                                    offset += textSpacing + computeTextWidth(textMetrics[i])
                                }

                            }
                        }
                    } else {
                        this.nextTextIndexTime -= delayTime
                    }

                }
            }
        }
        if (this.nextFireTime <= time) {
            if (this.quickFire && this.quickFireTime >= 0) {
                ArrayUtils.generate(Math.round(RandomUtils.randomNumberFromRange(1, 3)), () => {
                    this.fire()
                })
                this.computeNextQuickFireTime()
            } else {
                this.fire()
                this.computeNextFireTime()
            }
        }

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

