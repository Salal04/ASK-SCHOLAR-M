/**
 * Formats a raw count into a compact, human-friendly string.
 * e.g. 950 -> "950", 1200 -> "1.2k", 2500000 -> "2.5M"
 */
export function formatCompactNumber(value) {
  const n = Number(value) || 0;
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
}

/**
 * Pulls a popularity count out of a scholar object regardless of which
 * field name the backend uses for it, so the UI stays resilient to
 * minor API differences.
 */
export function getPopularityCount(scholar) {
  if (!scholar) return 0;
  return (
    scholar.popularityScore ??
    scholar.popularity?.score ??
    scholar.popularity?.count ??
    scholar.questionCount ??
    scholar.totalQuestions ??
    scholar.askCount ??
    0
  );
}

/** Pulls a 1-based popularity rank out of a scholar object, if present. */
export function getPopularityRank(scholar) {
  if (!scholar) return null;
  const rank = scholar.popularityRank ?? scholar.popularity?.rank ?? null;
  return typeof rank === "number" ? rank : null;
}
