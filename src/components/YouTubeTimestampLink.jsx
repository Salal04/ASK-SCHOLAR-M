import { useState } from "react";
import { buildEmbedUrl, buildWatchUrl, extractYouTubeId, formatTimestamp } from "../utils/youtube";

/**
 * Renders a clickable reference to a YouTube video at an exact
 * start/end timestamp (in seconds), as returned by the backend alongside
 * a scholar/user chat message. Clicking it expands an inline player that
 * jumps straight to that moment; there's also a plain link that opens the
 * same timestamp directly on YouTube.
 */
export default function YouTubeTimestampLink({ video }) {
  const [expanded, setExpanded] = useState(false);
  const videoId = extractYouTubeId(video?.url);

  if (!video?.url || !videoId) return null;

  const start = video.startSeconds ?? video.start ?? 0;
  const end = video.endSeconds ?? video.end ?? null;
  const watchUrl = buildWatchUrl(videoId, start);

  return (
    <div className="video-ref">
      <button
        type="button"
        className="video-ref-toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
        Watch at {formatTimestamp(start)}
        {end != null && <>–{formatTimestamp(end)}</>}
      </button>
      <a className="video-ref-link" href={watchUrl} target="_blank" rel="noopener noreferrer">
        Open in YouTube
      </a>

      {expanded && (
        <div className="video-ref-player">
          <iframe
            src={buildEmbedUrl(videoId, start, end)}
            title="Scholar video reference"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
