declare module 'yt-search' {
  interface VideoResult {
    videoId: string
    title: string
    seconds: number
    views: number
  }
  interface SearchResult {
    videos: VideoResult[]
  }
  function yts(query: string): Promise<SearchResult>
  export default yts
}
