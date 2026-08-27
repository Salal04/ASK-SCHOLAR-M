// A restrained 8-point geometric star pattern, echoing Islamic tilework,
// used as a single low-opacity signature element (hero backgrounds, empty
// states) rather than decoration scattered throughout the UI.
export default function GeometricMotif({ className, id = "star-motif" }) {
  const patternId = `${id}-pattern`;
  return (
    <svg className={className} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id={patternId} width="72" height="72" patternUnits="userSpaceOnUse">
          <g stroke="var(--color-brass, #c9a24b)" strokeWidth="1" fill="none">
            <path d="M36 4 L48 24 L68 36 L48 48 L36 68 L24 48 L4 36 L24 24 Z" />
            <circle cx="36" cy="36" r="4" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
