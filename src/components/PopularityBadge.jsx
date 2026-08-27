import { formatCompactNumber, getPopularityCount, getPopularityRank } from "../utils/format";

/**
 * Shows how popular a scholar is on the platform. `size="sm"` renders a
 * compact tag (used on scholar cards / grids); `size="lg"` renders a
 * labeled fact block (used on the scholar profile page).
 */
export default function PopularityBadge({ scholar, size = "sm" }) {
  const count = getPopularityCount(scholar);
  const rank = getPopularityRank(scholar);

  const fire = (
    <svg viewBox="0 0 24 24" width={size === "lg" ? 16 : 13} height={size === "lg" ? 16 : 13} fill="currentColor" aria-hidden="true">
      <path d="M12 2c1 3-3 4.5-3 8a3 3 0 0 0 6 0c1.5 1 2 2.7 2 4.2A5.2 5.2 0 0 1 12 22a5.2 5.2 0 0 1-5-6.8C7.7 12 12 9 12 2z" />
    </svg>
  );

  if (size === "lg") {
    return (
      <div className="profile-fact">
        <span className="fact-label">Popularity</span>
        <span className="fact-value popularity-value">
          {fire} {formatCompactNumber(count)} question{count === 1 ? "" : "s"} asked
          {rank && <span className="popularity-rank">#{rank} on platform</span>}
        </span>
      </div>
    );
  }

  return (
    <span className="tag popularity-tag" title={`${count} questions asked on this platform`}>
      {fire} {formatCompactNumber(count)}
      {rank && rank <= 3 ? ` · #${rank} popular` : ""}
    </span>
  );
}
