import type { AppProps } from 'next/app'
import "../assets/styles/global.sass"
export default function App({ Component, pageProps }: AppProps) {
  return <>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <Component {...pageProps} />
    </>
}
