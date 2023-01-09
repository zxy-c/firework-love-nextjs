import type { AppProps } from 'next/app'
import "../assets/styles/global.sass"
export default function App({ Component, pageProps }: AppProps) {
  return <>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
          {`
              @font-face{
              font-family: "hwxk";
              src: url("${process.env.NEXT_PUBLIC_BASE_PATH}/fonts/华文楷体.ttf")
          }`}
      </style>
      <Component {...pageProps} />
    </>
}
