export function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());

    // youtube.com/watch?v=ID
    if (parsed.hostname.includes('youtube.com') && parsed.pathname === '/watch') {
      return parsed.searchParams.get('v');
    }

    // youtube.com/shorts/ID
    if (parsed.hostname.includes('youtube.com') && parsed.pathname.startsWith('/shorts/')) {
      return parsed.pathname.split('/shorts/')[1].split('/')[0] || null;
    }

    // youtube.com/embed/ID
    if (parsed.hostname.includes('youtube.com') && parsed.pathname.startsWith('/embed/')) {
      return parsed.pathname.split('/embed/')[1].split('/')[0] || null;
    }

    // youtu.be/ID
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1).split('/')[0] || null;
    }

    return null;
  } catch {
    return null;
  }
}
