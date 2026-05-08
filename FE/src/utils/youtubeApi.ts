let apiPromise: Promise<void> | null = null

export function loadYouTubeApi(): Promise<void> {
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
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
