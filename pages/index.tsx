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
    //     const fontSize = 500
    //     const pointDistance = 5;
    //     if (font!=null){
    //         let ascender = font.ascender/font.unitsPerEm * fontSize;
    //         let path = font.getPath("钟",0,0,fontSize);
    //         context2D.strokeStyle = path.stroke||"black"
    //         context2D.lineWidth = path.strokeWidth
    //         console.log(path)
    //         path.commands.forEach((command,index)=>{
    //             if (command.type == "M"){
    //                 const x = command.x, y = ascender + command.y
    //                 context2D.fillRect(x,y,1,1)
    //             } else if (command.type=="C"){
    //                 const x = command.x, y = ascender + command.y
    //                 // context2D.fillRect( x,y,1,1)
    //                 let prevCommand = path.commands[index-1];
    //                 if (prevCommand.type!=="Z")
    //                     context2D.moveTo(prevCommand.x,ascender + prevCommand.y)
    //                 console.log("bezierCurveTo",command,prevCommand)
    //                 context2D.bezierCurveTo(command.x1,ascender+command.y2,command.x2,ascender+command.y2,command.x,ascender+command.y)
    //             }else if (command.type=="Q"){
    //
    //                 let prevCommand = path.commands[index-1];
    //                 // context2D.beginPath()
    //                 if (prevCommand.type!=="Z"){
    //                     const prevX = prevCommand.x, prevY = ascender + prevCommand.y
    //                     let length = BezierUtils.getTwoOrderBezierLength([prevX,prevY],[command.x1,ascender + command.y1],[command.x,ascender+command.y]);
    //                     ArrayUtils.generate(Math.ceil(length/pointDistance),index=>{
    //                         let [x,y] = BezierUtils.getTwoOrderBezierPoint(index/length*pointDistance,[prevX,prevY],[command.x1,ascender + command.y1],[command.x,ascender+command.y]);
    //                         context2D.fillRect(x,y,1,1)
    //                     })
    //                     // context2D.moveTo(prevCommand.x,ascender + prevCommand.y)
    //                     // context2D.quadraticCurveTo(command.x1,ascender+command.y1,command.x,ascender+command.y)
    //                     // context2D.stroke()
    //                 }
    //             }else if (command.type == "L"){
    //                 context2D.fillRect( command.x,ascender +command.y,1,1)
    //             }
    //         })
    //     }
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
