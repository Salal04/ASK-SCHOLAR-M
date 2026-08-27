/**
 * Extracts the 11-character video ID from any common YouTube URL shape
 * (watch?v=, youtu.be/, embed/, shorts/). Returns null if it can't parse.
 */
export function extractYouTubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1).split("/")[0] || null;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const match = u.pathname.match(/\/(embed|shorts)\/([^/?]+)/);
      if (match) return match[2];
    }
  } catch {
    /* not a valid absolute URL */
  }
  return null;
}

/** Formats whole seconds as m:ss (or h:mm:ss once it runs past an hour). */
export function formatTimestamp(totalSeconds) {
  const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

/** Builds a standard watch-page link that opens/seeks to startSeconds. */
export function buildWatchUrl(videoId, startSeconds) {
  const start = Math.max(0, Math.floor(Number(startSeconds) || 0));
  return `https://www.youtube.com/watch?v=${videoId}&t=${start}s`;
}

/** Builds an embeddable player URL that starts (and stops) at the given times. */
export function buildEmbedUrl(videoId, startSeconds, endSeconds) {
  const params = new URLSearchParams({ autoplay: "1", start: String(Math.max(0, Math.floor(Number(startSeconds) || 0))) });
  if (endSeconds != null && Number(endSeconds) > Number(startSeconds)) {
    params.set("end", String(Math.floor(Number(endSeconds))));
  }
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}
