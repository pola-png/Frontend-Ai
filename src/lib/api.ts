// src/lib/api.ts
import axios from 'axios';
import type { Match, Prediction, Team } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

/** Helpers **/
function toDecimalOdds(prob?: number | null): number | null {
  if (!prob || typeof prob !== 'number' || prob <= 0) return null;
  const o = 1 / prob;
  return parseFloat(o.toFixed(2));
}

function safeId(obj: any) {
  return obj?._id ?? obj?.id ?? null;
}

function normalizeTeam(raw: any): Team {
  if (!raw) return { id: 'unknown', name: 'Unknown' };
  return {
    id: safeId(raw) || String(raw),
    name: raw.name || raw.teamName || 'Unknown',
    logoUrl: raw.logo || raw.logoUrl || raw.image || null,
  };
}

/**
 * Choose primary prediction market from outcomes using priority:
 * doubleChance > over25 > over15 > over05 > btts > oneXTwo
 * and return readable text + decimal odds (1/probability)
 */
function getPredictionDetailsFromOutcomes(outcomes: any) {
  if (!outcomes || typeof outcomes !== 'object') {
    return { prediction: 'N/A', odds: 1.0, market: 'unknown' };
  }

  // 1) doubleChance
  if (outcomes.doubleChance) {
    const dc = outcomes.doubleChance;
    const entries = Object.entries(dc); // [ ['homeOrDraw', 0.7], ... ]
    const best = entries.reduce((acc, cur) => (cur[1] > acc[1] ? cur : acc), ['', -1]);
    if (best[1] > 0) {
      const labelMap: Record<string, string> = {
        homeOrDraw: 'Home or Draw',
        homeOrAway: 'Home or Away',
        drawOrAway: 'Draw or Away',
      };
      const label = labelMap[best[0]] ?? best[0];
      const odds = toDecimalOdds(best[1]) ?? 1.0;
      return { prediction: `Double Chance: ${label}`, odds, market: 'doubleChance' };
    }
  }

  // 2) overs (choose the most confident overX among available)
  const overs = ['over25', 'over15', 'over05'];
  let bestOverKey = '';
  let bestOverVal = -1;
  for (const k of overs) {
    if (typeof outcomes[k] === 'number' && outcomes[k] > bestOverVal) {
      bestOverVal = outcomes[k];
      bestOverKey = k;
    }
  }
  if (bestOverVal > -1) {
    const labelMap: Record<string, string> = {
      over05: 'Over 0.5',
      over15: 'Over 1.5',
      over25: 'Over 2.5',
    };
    const odds = toDecimalOdds(bestOverVal) ?? 1.0;
    return { prediction: labelMap[bestOverKey] ?? bestOverKey, odds, market: bestOverKey };
  }

  // 3) BTTS
  if (typeof outcomes.bttsYes === 'number' || typeof outcomes.bttsNo === 'number') {
    const yes = outcomes.bttsYes ?? 0;
    const no = outcomes.bttsNo ?? 0;
    if (yes >= no) {
      return { prediction: 'Both Teams To Score - Yes', odds: toDecimalOdds(yes) ?? 1.0, market: 'bttsYes' };
    } else {
      return { prediction: 'Both Teams To Score - No', odds: toDecimalOdds(no) ?? 1.0, market: 'bttsNo' };
    }
  }

  // 4) oneXTwo (fallback)
  if (outcomes.oneXTwo) {
    const { home = 0, draw = 0, away = 0 } = outcomes.oneXTwo;
    const max = Math.max(home, draw, away);
    if (max <= 0) return { prediction: 'N/A', odds: 1.0, market: 'oneXTwo' };
    if (max === home) return { prediction: 'Home Win', odds: toDecimalOdds(home) ?? 1.0, market: 'oneXTwo' };
    if (max === away) return { prediction: 'Away Win', odds: toDecimalOdds(away) ?? 1.0, market: 'oneXTwo' };
    return { prediction: 'Draw', odds: toDecimalOdds(draw) ?? 1.0, market: 'oneXTwo' };
  }

  // 5) fallback: choose any numeric field as probability
  const flatVals = Object.keys(outcomes).map(k => ({ k, v: outcomes[k] }))
    .filter(e => typeof e.v === 'number')
    .sort((a, b) => b.v - a.v);
  if (flatVals.length > 0) {
    return { prediction: String(flatVals[0].k), odds: toDecimalOdds(flatVals[0].v) ?? 1.0, market: flatVals[0].k };
  }

  return { prediction: 'N/A', odds: 1.0, market: 'unknown' };
}

/** Normalizers **/
export const normalizePrediction = (rawPrediction: any): Prediction | null => {
  if (!rawPrediction) return null;

  // ID
  const id = rawPrediction._id ?? rawPrediction.id ?? `${rawPrediction.matchId ?? 'm'}-${rawPrediction.bucket ?? 'b'}-${Math.random().toString(36).slice(2,7)}`;

  // If match context is nested in matchId or provided separately
  const matchData = (rawPrediction.matchId && typeof rawPrediction.matchId === 'object')
    ? rawPrediction.matchId
    : (rawPrediction.match || rawPrediction.matchContext || null);

  // Derive teams either from direct prediction payload (if provided) or from matchData
  const homeRaw = rawPrediction.homeTeam ?? matchData?.homeTeam;
  const awayRaw = rawPrediction.awayTeam ?? matchData?.awayTeam;

  if (!homeRaw || !awayRaw) {
    // prediction without team info; skip
    return null;
  }

  const homeTeam = normalizeTeam(homeRaw);
  const awayTeam = normalizeTeam(awayRaw);

  // Compute textual prediction + odds from outcomes
  const outcomes = rawPrediction.outcomes ?? rawPrediction;
  const marketResult = getPredictionDetailsFromOutcomes(outcomes);

  const predictionText = rawPrediction.prediction ?? marketResult.prediction;
  const odds = rawPrediction.odds ?? marketResult.odds ?? 1.0;

  const matchId = safeId(matchData) ?? rawPrediction.matchId ?? null;
  const matchDateUtc = matchData?.matchDateUtc ?? matchData?.date ?? rawPrediction.matchDateUtc ?? rawPrediction.date ?? null;
  const league = matchData?.league ?? matchData?.competition ?? rawPrediction.league ?? 'Unknown League';

  return {
    id,
    matchId,
    prediction: predictionText,
    odds: typeof odds === 'number' ? odds : parseFloat(String(odds)) || 1.0,
    confidence: rawPrediction.confidence ?? rawPrediction.confidencePct ?? null,
    bucket: rawPrediction.bucket ?? 'unknown',
    status: rawPrediction.status ?? 'pending',
    is_vip: !!rawPrediction.is_vip || rawPrediction.bucket === 'vip',
    analysis: rawPrediction.analysis ?? rawPrediction.notes ?? null,
    outcomes: outcomes,
    homeTeam,
    awayTeam,
    league,
    matchDateUtc,
  };
};

export const normalizeMatch = (rawMatch: any): Match | null => {
  if (!rawMatch) return null;

  const id = rawMatch._id ?? rawMatch.id ?? String(Math.random().toString(36).slice(2,9));
  const homeTeam = normalizeTeam(rawMatch.homeTeam);
  const awayTeam = normalizeTeam(rawMatch.awayTeam);
  const matchDateUtc = rawMatch.matchDateUtc ?? rawMatch.date ?? null;
  const league = rawMatch.league ?? rawMatch.competition ?? 'Unknown League';

  // Normalize nested predictions (if any)
  const rawPredictions = rawMatch.predictions ?? [];
  const predictions = rawPredictions
    .map((p: any) => normalizePrediction({ ...p, matchId: { _id: id, homeTeam: rawMatch.homeTeam, awayTeam: rawMatch.awayTeam, league, matchDateUtc } }))
    .filter((p: any) => p !== null);

  // Top-level single prediction (some result endpoints use `prediction` on the match root)
  let topLevelPrediction = null;
  if (rawMatch.prediction) {
    topLevelPrediction = normalizePrediction({ ...rawMatch.prediction, matchId: { _id: id, homeTeam: rawMatch.homeTeam, awayTeam: rawMatch.awayTeam, league, matchDateUtc }});
  }

  return {
    id,
    league,
    matchDateUtc,
    status: rawMatch.status ?? rawMatch.matchStatus ?? 'scheduled',
    homeTeam,
    awayTeam,
    scores: rawMatch.scores ?? rawMatch.score ?? null,
    predictions,
    prediction: topLevelPrediction ?? undefined,
    outcome: rawMatch.outcome ?? undefined,
  };
};

/** API call wrappers **/

export const getPredictionsByBucket = async (bucket: string): Promise<any[]> => {
  try {
    const res = await api.get(`/predictions/${bucket}`);
    const data = res.data ?? [];

    // If backend returned grouped arrays (arrays of arrays), flatten them to a single flat array
    const isGrouped = Array.isArray(data) && data.length > 0 && Array.isArray(data[0]);
    const flat = isGrouped ? (data as any[]).flat() : (data as any[]);

    const normalized: any[] = flat
      .map(normalizePrediction)
      .filter((p): p is any => p !== null);

    return normalized;
  } catch (err) {
    console.error('API: getPredictionsByBucket failed', err);
    return [];
  }
};

export const getResults = async (): Promise<Match[]> => {
  try {
    const res = await api.get('/results');
    const raw: any[] = res.data ?? [];
    return raw.map(normalizeMatch).filter((m): m is Match => m !== null);
  } catch (err) {
    console.error('API: getResults failed', err);
    return [];
  }
};

export const getUpcomingMatches = async (): Promise<Match[]> => {
  try {
    const res = await api.get('/matches/upcoming');
    const raw: any[] = res.data ?? [];
    return raw.map(normalizeMatch).filter((m): m is Match => m !== null);
  } catch (err) {
    console.error('API: getUpcomingMatches failed', err);
    return [];
  }
};

export const getMatchSummary = async (matchId: string): Promise<Match | null> => {
  try {
    const res = await api.get(`/summary/${matchId}`);
    return normalizeMatch(res.data);
  } catch (err) {
    console.error(`API: getMatchSummary failed for ${matchId}`, err);
    return null;
  }
};
