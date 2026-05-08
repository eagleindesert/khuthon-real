declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void
  }
}

let apiPromise: Promise<void> | null = null

export function loadYouTubeApi(): Promise<void> {
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve) => {
    if (typeof YT !== 'undefined' && YT.Player) {
      resolve()
      return
    }
    window.onYouTubeIframeAPIReady = resolve
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  })

  return apiPromise
}
