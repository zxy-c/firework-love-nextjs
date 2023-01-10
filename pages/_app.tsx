import type { AppProps } from 'next/app'
import "../assets/styles/global.sass"
import {useEffect, useState} from "react";
export default function App({ Component, pageProps }: AppProps) {
    const [styleString,setStyleString] = useState("")
    useEffect(()=>{
        setStyleString(`
              @font-face{
              font-family: \"hwxk\";
              src: url(\"${process.env.NEXT_PUBLIC_BASE_PATH}/fonts/华文楷体.ttf\")
          }`)
    },[])
  return <>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
          {styleString}
      </style>
      <Component {...pageProps} />
    </>
}
