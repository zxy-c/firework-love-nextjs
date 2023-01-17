import styles from './index.module.sass'
import {useEffect, useRef, useState} from "react";
import GameManager from "../components/GameManager";

export default function Home() {
    const [loading,setLoading] = useState(true)
  useEffect(()=>{
      console.log("useEffect")
      const canvas = canvasRef.current!
      canvas.width = document.body.getBoundingClientRect().width
      canvas.height = document.body.getBoundingClientRect().height
      let context2D = canvas.getContext("2d")!;
      context2D.fillStyle = "black"
      context2D.fillRect(0,0,canvas.width,canvas.height)
      let gameManager = new GameManager(canvas);
      gameManager.onLoad = ()=>{
          setLoading(false)
      }
      return ()=>{
          gameManager.dispose()
      }
  },[])
    let canvasRef = useRef<HTMLCanvasElement|null>(null);
  return (
    <>
      <canvas ref={canvasRef}>

      </canvas>
        {loading ? <div className={styles.loading}>
            加载中
        </div> : null}

    </>
  )
}
