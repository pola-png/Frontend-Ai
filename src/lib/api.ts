// src/lib/api.ts
import axios from 'axios';
import type { Match, Prediction, Team } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

function getId(obj: any) {
  if (!obj) return undefined;
  return obj._id || obj.id || undefined;
}

function normalizeTeam(raw: any): Team {
  if (!raw) return { id: 'unknown', name: 'Unknown' };
  return {
    id: getId(raw) || `${raw.name || 'team'}-${Math.random().toString(36).slice(2, 8)}`,
    name: raw.name || raw.teamName || 'Unknown Team',
    logoUrl: raw.logo || raw.logoUrl || null,
  };
}

/**
 * Pick preferred outcome based on priority:
 * 1) doubleChance (highest value among homeOrAway/homeOrDraw/drawOrAway)
 * 2) over05 / over15 / over25 (prefer the one present, prefer highest probability)
 * 3) bttsYes / bttsNo (prefer bttsYes if > bttsNo)
 * 4) oneXTwo (home/draw/away)
 *
 * Returns { label, probability } where probability is [0..1].
 */
function selectPreferredOutcome(outcomes: any) {
  if (!outcomes) return { label: 'N/A', probability: 0.0 };

  // Double chance
  if (outcomes.doubleChance) {
    const dc = outcomes.doubleChance;
    const entries: Array<{ key: string; label: string; val: number }> = [];
    if (typeof dc.homeOrAway === 'number') entries.push({ key: 'homeOrAway', label: 'Double Chance (H/A)', val: dc.homeOrAway });
    if (typeof dc.homeOrDraw === 'number') entries.push({ key: 'homeOrDraw', label: 'Double Chance (H/D)', val: dc.homeOrDraw });
    if (typeof dc.drawOrAway === 'number') entries.push({ key: 'drawOrAway', label: 'Double Chance (D/A)', val: dc.drawOrAway });

    if (entries.length) {
      entries.sort((a, b) => b.val - a.val);
      return { label: entries[0].label, probability: entries[0].val };
    }
  }

  // Overs (prefer the highest-probability overs available)
  const overs: Array<{ label: string; val?: number }> = [
    { label: 'Over 0.5', val: outcomes.over05 },
    { label: 'Over 1.5', val: outcomes.over15 },
    { label: 'Over 2.5', val: outcomes.over25 },
  ].filter(x => typeof x.val === 'number') as any;

  if (overs.length) {
    overs.sort((a, b) => (b.val as number) - (a.val as number));
    return { label: overs[0].label, probability: overs[0].val as number };
  }

  // BTTS
  if (typeof outcomes.bttsYes === 'number' || typeof outcomes.bttsNo === 'number') {
    const yes = typeof outcomes.bttsYes === 'number' ? outcomes.bttsYes : 0;
    const no = typeof outcomes.bttsNo === 'number' ? outcomes.bttsNo : 0;
    if (yes >= no) return { label: 'Both Teams To Score (Yes)', probability: yes };
    return { label: 'Both Teams To Score (No)', probability: no };
  }

  // Fallback to oneXTwo
  if (outcomes.oneXTwo) {
    const { home, draw, away } = outcomes.oneXTwo;
    const maxVal = Math.max(home ?? 0, draw ?? 0, away ?? 0);
    if (maxVal === home) return { label: 'Home Win', probability: home ?? 0 };
    if (maxVal === away) return { label: 'Away Win', probability: away ?? 0 };
    return { label: 'Draw', probability: draw ?? 0 };
  }

  return { label: 'N/A', probability: 0.0 };
}

function probToDecimal(prob: number) {
  if (!prob || prob <= 0) return 1.0;
  const dec = 1 / prob;
  // clamp to reasonable range and round
  return Math.max(1.0, Math.round(dec * 100) / 100);
}

/**
 * Normalize a raw prediction object into the UI-friendly Prediction type.
 * Accepts several shapes (prediction alone, prediction with match context).
 */
export const normalizePrediction = (rawPrediction: any): Prediction | null => {
  if (!rawPrediction) return null;

  // If backend returned a "match" object (with nested predictions array),
  // this function expects a prediction object that possibly has matchContext attached.
  const id = getId(rawPrediction) || (rawPrediction._id && String(rawPrediction._id)) || (rawPrediction.id && String(rawPrediction.id)) || undefined;

  // Determine match context:
  const matchContext = rawPrediction.matchContext || rawPrediction.matchId || (rawPrediction.homeTeam && rawPrediction.awayTeam ? rawPrediction : undefined);

  if (!matchContext || !(matchContext.homeTeam && matchContext.awayTeam)) {
    // If there's no match context, we can't render a prediction card with teams
    return null;
  }

  const matchId = getId(matchContext) || matchContext.id || undefined;

  const homeTeam = normalizeTeam(matchContext.homeTeam);
  const awayTeam = normalizeTeam(matchContext.awayTeam);

  // choose preferred outcome and compute decimal odds
  const chosen = selectPreferredOutcome(rawPrediction.outcomes || matchContext.outcomes || {});
  const calcOdds = rawPrediction.odds ?? probToDecimal(chosen.probability);

  const predictionText = rawPrediction.prediction || chosen.label || 'N/A';

  const confidence = typeof rawPrediction.confidence === 'number'
    ? rawPrediction.confidence
    : typeof rawPrediction.confidence === 'string'
      ? Number(rawPrediction.confidence)
      : undefined;

  // matchDate fallback date
  const matchDate = matchContext.matchDateUtc || matchContext.date || matchContext.matchDate || matchContext.kickoff || undefined;

  return {
    id: String(id || (`${matchId}-${rawPrediction.bucket || Math.random().toString(36).slice(2,6)}`)),
    matchId: String(matchId || ''),
    prediction: predictionText,
    odds: typeof calcOdds === 'number' ? calcOdds : 1.0,
    confidence,
    bucket: rawPrediction.bucket || rawPrediction.type || 'unknown',
    status: rawPrediction.status || 'pending',
    is_vip: !!rawPrediction.is_vip,
    analysis: rawPrediction.analysis,
    outcomes: rawPrediction.outcomes || rawPrediction.outcome,

    // flattened match context
    homeTeam,
    awayTeam,
    league: matchContext.league || matchContext.competition || 'Unknown League',
    matchDateUtc: matchDate,
  };
};

/**
 * Normalize a raw match object into a UI-friendly Match object.
 * Handles matches coming from /matches/upcoming or /results endpoints.
 */
export const normalizeMatch = (rawMatch: any): Match | null => {
  if (!rawMatch) return null;

  const id = getId(rawMatch) || rawMatch.id || undefined;
  const homeTeam = normalizeTeam(rawMatch.homeTeam);
  const awayTeam = normalizeTeam(rawMatch.awayTeam);
  const matchDate = rawMatch.matchDateUtc || rawMatch.date || rawMatch.matchDate || undefined;

  // normalize nested predictions if present
  const nested = Array.isArray(rawMatch.predictions)
    ? rawMatch.predictions.map((p: any) => {
        // preserve match context inside each pred so normalizePrediction can use it
        return normalizePrediction({ ...p, matchContext: rawMatch });
      }).filter((p: Prediction | null): p is Prediction => p !== null)
    : [];

  // sometimes top-level prediction exists (for results)
  let topLevelPrediction: Prediction | undefined;
  if (rawMatch.prediction) {
    const pred = normalizePrediction({ ...rawMatch.prediction, matchContext: rawMatch });
    if (pred) topLevelPrediction = pred;
  }

  const allPredictions = topLevelPrediction ? [topLevelPrediction, ...nested] : nested;

  return {
    id: String(id || (Math.random().toString(36).slice(2, 10))),
    league: rawMatch.league || rawMatch.competition || 'Unknown League',
    matchDateUtc: matchDate,
    status: rawMatch.status || 'scheduled',
    homeTeam,
    awayTeam,
    scores: rawMatch.score || rawMatch.scores || undefined,
    predictions: allPredictions.length ? allPredictions : undefined,
    prediction: topLevelPrediction,
    outcome: rawMatch.outcome || undefined,
  };
};

/* -------------------- API methods -------------------- */

export const getPredictionsByBucket = async (bucket: string): Promise<Prediction[]> => {
  try {
    const res = await api.get(`/predictions/${bucket}`);
    const data = res.data || [];

    // Case A: API returned list of "match" objects with nested predictions
    if (Array.isArray(data) && data.length && data[0].homeTeam && Array.isArray(data[0].predictions)) {
      const flattened = data.flatMap((matchObj: any) =>
        (matchObj.predictions || []).map((p: any) => ({ ...p, matchContext: matchObj }))
      );
      return flattened
        .map(normalizePrediction)
        .filter((p): p is Prediction => p !== null);
    }

    // Case B: API returned grouped arrays of predictions (e.g., [[p1,p2], [p3]])
    if (Array.isArray(data) && data.length && Array.isArray(data[0])) {
      const flattened = data.flat();
      return flattened
        .map(normalizePrediction)
        .filter((p): p is Prediction => p !== null);
    }

    // Case C: API returned plain array of prediction objects (each with matchId or matchContext)
    if (Array.isArray(data)) {
      return data
        .map((p: any) => normalizePrediction(p))
        .filter((p): p is Prediction => p !== null);
    }

    return [];
  } catch (err) {
    console.error(`getPredictionsByBucket(${bucket}) failed:`, err);
    return [];
  }
};

export const getResults = async (): Promise<Match[]> => {
  try {
    const res = await api.get('/results');
    const rawMatches: any[] = res.data || [];
    return rawMatches
      .map(normalizeMatch)
      .filter((m): m is Match => m !== null);
  } catch (err) {
    console.error("Failed to fetch results:", err);
    return [];
  }
};

export const getUpcomingMatches = async (): Promise<Match[]> => {
  try {
    const res = await api.get('/matches/upcoming');
    const rawMatches: any[] = res.data || [];
    return rawMatches
      .map(normalizeMatch)
      .filter((m): m is Match => m !== null);
  } catch (err) {
    console.error("Failed to fetch upcoming matches:", err);
    return [];
  }
};

export const getMatchSummary = async (matchId: string): Promise<Match | null> => {
  try {
    const res = await api.get(`/summary/${matchId}`);
    return normalizeMatch(res.data);
  } catch (err) {
    console.error(`Failed to fetch summary for match ${matchId}:`, err);
    return null;
  }
};
