import { Inter } from '@next/font/google'
import styles from './index.module.sass'
import {useEffect, useRef} from "react";
import opentype from "opentype.js"
import BezierUtils from "../utils/BezierUtils";
import ArrayUtils from "@zxy-cn/array-utils";
import GameManager from "../components/GameManager";
const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  useEffect(()=>{
      console.log("useEffect")
      const canvas = canvasRef.current!
      canvas.width = document.body.getBoundingClientRect().width
      canvas.height = document.body.getBoundingClientRect().height
      let context2D = canvas.getContext("2d")!;
      context2D.fillStyle = "black"
      context2D.fillRect(0,0,canvas.width,canvas.height)
      let gameManager = new GameManager(canvas);

    // opentype.load("/fonts/华文楷体.ttf",(error, font) => {
    //
    //
    //     console.log(canvas.width,canvas.height)
    //     console.log(font)

    // })
      return ()=>{
          gameManager.dispose()
      }
  },[])
    let canvasRef = useRef<HTMLCanvasElement|null>(null);
  return (
    <>
      <canvas className={styles.canvas} ref={canvasRef}>

      </canvas>
    </>
  )
}
