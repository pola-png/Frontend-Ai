import axios from 'axios';
import type { Match, Prediction, Team } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Convert a probability (0..1) to a consumer-friendly decimal odd.
 * If probability is zero-ish, return null to indicate invalid market.
 * We clamp to reasonable bounds to avoid absurd values.
 */
function probToDecimal(prob?: number | null): number | null {
  if (!prob || typeof prob !== 'number' || prob <= 0) return null;
  // decimal odds = 1 / prob
  const odd = 1 / prob;
  // clamp to max 100 and min 1.01 (to avoid Infinity)
  const clamped = Math.min(Math.max(odd, 1.01), 100);
  return Math.round(clamped * 100) / 100;
}

/**
 * Choose a preferred market from a prediction's outcomes.
 * Priority (frontend preference): doubleChance (if strong) -> over15/over25/over05 -> btts -> oneXTwo fallback
 * Returns chosen market key, market description, market probability (0..1), and decimal odds.
 */
function choosePreferredMarket(outcomes: any) {
  if (!outcomes) return null;

  // Double chance: prefer any doubleChance option with reasonably high probability
  if (outcomes.doubleChance) {
    const dc = outcomes.doubleChance;
    // find the largest doubleChance probability and its label
    const dcEntries = [
      { key: 'homeOrDraw', label: 'Double Chance (Home or Draw)', prob: dc.homeOrDraw },
      { key: 'homeOrAway', label: 'Double Chance (Home or Away)', prob: dc.homeOrAway },
      { key: 'drawOrAway', label: 'Double Chance (Draw or Away)', prob: dc.drawOrAway },
    ].filter(e => typeof e.prob === 'number');

    if (dcEntries.length) {
      dcEntries.sort((a, b) => (b.prob - a.prob));
      const best = dcEntries[0];
      // prefer double chance when probability >= 0.6 (tuneable)
      if (best.prob >= 0.55) {
        const odds = probToDecimal(best.prob);
        if (odds) return { marketKey: best.key, marketLabel: best.label, marketProb: best.prob, odds };
      }
    }
  }

  // Over markets: check over25, over15, over05 in that order
  const overPriority = [
    { key: 'over25', label: 'Over 2.5 Goals', prob: outcomes?.over25 },
    { key: 'over15', label: 'Over 1.5 Goals', prob: outcomes?.over15 },
    { key: 'over05', label: 'Over 0.5 Goals', prob: outcomes?.over05 },
  ];
  for (const o of overPriority) {
    if (typeof o.prob === 'number' && o.prob >= 0.6) {
      const odds = probToDecimal(o.prob);
      if (odds) return { marketKey: o.key, marketLabel: o.label, marketProb: o.prob, odds };
    }
  }

  // BTTS
  if (typeof outcomes?.bttsYes === 'number' && outcomes.bttsYes >= 0.6) {
    const odds = probToDecimal(outcomes.bttsYes);
    if (odds) return { marketKey: 'bttsYes', marketLabel: 'Both Teams to Score (Yes)', marketProb: outcomes.bttsYes, odds };
  }

  // Fallback to oneXTwo maximum
  if (outcomes?.oneXTwo) {
    const { home, draw, away } = outcomes.oneXTwo;
    if (typeof home === 'number' && typeof draw === 'number' && typeof away === 'number') {
      const max = Math.max(home, draw, away);
      let label = 'Draw';
      let prob = draw;
      if (max === home) { label = 'Home Win'; prob = home; }
      else if (max === away) { label = 'Away Win'; prob = away; }
      const odds = probToDecimal(prob);
      if (odds) return { marketKey: 'oneXTwo', marketLabel: label, marketProb: prob, odds };
    }
  }

  // If nothing, return null
  return null;
}

/**
 * Normalize a raw prediction object from the API to frontend-friendly shape.
 * Will flatten match info (matchId) when present.
 */
const normalizePrediction = (rawPrediction: any): Prediction | null => {
  if (!rawPrediction) return null;

  // match context may be nested in matchId (for predictions endpoints) or at root (for results)
  const matchData = rawPrediction.matchId && typeof rawPrediction.matchId === 'object' ? rawPrediction.matchId : rawPrediction;

  if (!matchData || !matchData.homeTeam || !matchData.awayTeam) {
    // invalid, skip
    return null;
  }

  const chosen = choosePreferredMarket(rawPrediction.outcomes);
  // if API provided a top-level `prediction` string, keep as user-friendly label,
  // but we still prefer our chosen market label to compute odds and show market choice.
  const predText = rawPrediction.prediction || (chosen ? chosen.marketLabel : undefined);

  return {
    id: rawPrediction._id || rawPrediction.id || `${matchData._id || 'unknown'}-${rawPrediction.bucket || 'pred'}`,
    prediction: predText || 'N/A',
    odds: chosen?.odds ?? (typeof rawPrediction.odds === 'number' ? rawPrediction.odds : 1.0),
    // keep original probability too for display
    marketProb: chosen?.marketProb ?? undefined,
    market: chosen?.marketKey ?? undefined,
    marketLabel: chosen?.marketLabel ?? undefined,

    bucket: rawPrediction.bucket,
    confidence: rawPrediction.confidence,
    outcomes: rawPrediction.outcomes,
    status: rawPrediction.status || 'pending',
    is_vip: rawPrediction.is_vip || false,
    analysis: rawPrediction.analysis || undefined,

    // flattened match
    matchId: matchData._id || matchData.id,
    homeTeam: matchData.homeTeam,
    awayTeam: matchData.awayTeam,
    league: matchData.league || matchData.competition || 'Unknown League',
    matchDateUtc: matchData.matchDateUtc || matchData.date || matchData.datetime,
  } as Prediction;
};

/**
 * Normalize a raw match object (used for results/upcoming endpoints)
 */
const normalizeMatch = (rawMatch: any): Match | null => {
  if (!rawMatch || !rawMatch._id || !rawMatch.homeTeam || !rawMatch.awayTeam) return null;

  // Normalize nested predictions if present (array)
  const nestedPredictions = (rawMatch.predictions || [])
    .map(normalizePrediction)
    .filter((p): p is Prediction => p !== null);

  // If a top-level prediction exists (result payload), normalize it as well
  let topLevelPrediction: Prediction | undefined;
  if (rawMatch.prediction) {
    const predWithContext = { ...rawMatch.prediction, ...rawMatch };
    topLevelPrediction = normalizePrediction(predWithContext) || undefined;
  }

  const allPreds = topLevelPrediction ? [topLevelPrediction, ...nestedPredictions] : nestedPredictions;

  return {
    id: rawMatch._id,
    league: rawMatch.league || rawMatch.competition || 'Unknown League',
    matchDateUtc: rawMatch.matchDateUtc || rawMatch.date || rawMatch.datetime,
    status: rawMatch.status,
    homeTeam: rawMatch.homeTeam,
    awayTeam: rawMatch.awayTeam,
    scores: rawMatch.score || rawMatch.scores || rawMatch.result || undefined,
    predictions: allPreds,
    prediction: topLevelPrediction,
    outcome: rawMatch.outcome,
  } as Match;
};

/* ---------- exported fetchers ---------- */

export const getPredictionsByBucket = async (bucket: string): Promise<Prediction[]> => {
  try {
    const res = await api.get(`/predictions/${bucket}`);
    const predictionGroups: any[] = res.data || [];
    // API returns groups per match (array of arrays). Flatten but keep match grouping not lost in normalized prediction.
    const flattened = Array.isArray(predictionGroups) ? predictionGroups.flat() : [];
    return flattened
      .map(normalizePrediction)
      .filter((p): p is Prediction => p !== null);
  } catch (e) {
    console.error(`Failed to fetch predictions for bucket ${bucket}:`, e);
    return [];
  }
};

export const getResults = async (): Promise<Match[]> => {
  try {
    const res = await api.get('/results');
    const rawMatches: any[] = res.data || [];
    return rawMatches.map(normalizeMatch).filter((m): m is Match => m !== null);
  } catch (e) {
    console.error('Failed to fetch results:', e);
    return [];
  }
};

export const getUpcomingMatches = async (): Promise<Match[]> => {
  try {
    const res = await api.get('/matches/upcoming');
    const rawMatches: any[] = res.data || [];
    return rawMatches.map(normalizeMatch).filter((m): m is Match => m !== null);
  } catch (e) {
    console.error('Failed to fetch upcoming matches:', e);
    return [];
  }
};

export const getMatchSummary = async (matchId: string): Promise<Match | null> => {
  try {
    const res = await api.get(`/summary/${matchId}`);
    return normalizeMatch(res.data);
  } catch (e) {
    console.error(`Failed to fetch summary for match ${matchId}:`, e);
    return null;
  }
};

export default api;
