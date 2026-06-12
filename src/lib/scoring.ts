// Viral score utility. Pure functions, safe to import from client or server.

export type ViralBand = "clone-now" | "worth-cloning" | "marginal" | "skip";

export type ViralFactors = {
  engagementRate: number; // 0-1 (e.g. 0.084 = 8.4%)
  velocity: number; // engagement per hour
  reachMultiplier: number; // views / followers, capped
  hoursSincePosted: number | null;
  topFactor: string; // short human label of dominant driver
};

export type ViralScoreResult = {
  score: number; // 0-100
  band: ViralBand;
  bandLabel: string;
  recommendation: string;
  factors: ViralFactors;
};

export function bandFor(score: number): { band: ViralBand; bandLabel: string; recommendation: string } {
  if (score >= 80) return { band: "clone-now", bandLabel: "Clone this now", recommendation: "Strong viral signal. Build a clone before the topic cools." };
  if (score >= 60) return { band: "worth-cloning", bandLabel: "Worth cloning", recommendation: "Solid performance. A clone in your voice should perform." };
  if (score >= 40) return { band: "marginal", bandLabel: "Marginal", recommendation: "Only clone if it fits your brand or you can sharpen the angle." };
  return { band: "skip", bandLabel: "Skip", recommendation: "Below-average traction. Likely not worth your time — try another post." };
}

/**
 * Compute viral score from a scraped Instagram post.
 * Accepts the raw Apify-shaped object used in analyze.functions.ts.
 */
export function computeViralScore(scraped: any | null): ViralScoreResult {
  const likes = Number(scraped?.likesCount ?? 0);
  const comments = Number(scraped?.commentsCount ?? 0);
  const saves = Number(scraped?.savesCount ?? 0); // rarely present
  const views = Number(scraped?.videoViewCount ?? scraped?.videoPlayCount ?? 0);
  const followers = Math.max(1, Number(scraped?.owner?.followersCount ?? scraped?.followersCount ?? 0));
  const ts = scraped?.timestamp ? Date.parse(scraped.timestamp) : NaN;
  const hoursSincePosted = isFinite(ts) ? Math.max(0.5, (Date.now() - ts) / 3_600_000) : null;

  const weightedEngagement = likes + comments * 3 + saves * 5;
  const engagementRate = followers > 0 ? weightedEngagement / followers : 0;
  const velocity = engagementRate / Math.max(hoursSincePosted ?? 24, 1);
  const reachMultiplier = views > 0 && followers > 0 ? Math.min(views / followers, 10) : 1;

  // Score = log-scaled velocity * reach, normalized to roughly 0-100.
  const raw = Math.log10(Math.max(velocity * reachMultiplier * 1000, 0.0001)) * 25 + 40;
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  // Pick the most explanatory factor.
  let topFactor = `${(engagementRate * 100).toFixed(1)}% engagement`;
  if (reachMultiplier >= 3) topFactor = `${reachMultiplier.toFixed(1)}× views/followers`;
  else if (hoursSincePosted != null && hoursSincePosted <= 24 && velocity > 0)
    topFactor = `${(engagementRate * 100).toFixed(1)}% engagement in ${Math.round(hoursSincePosted)}h`;

  const meta = bandFor(score);
  return {
    score,
    ...meta,
    factors: {
      engagementRate,
      velocity,
      reachMultiplier,
      hoursSincePosted,
      topFactor,
    },
  };
}
