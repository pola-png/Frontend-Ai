// src/lib/api.ts
import axios from "axios";
import type { Match, Prediction } from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // should include /api if your backend requires it
  headers: { "Content-Type": "application/json" },
});

/** Helpers **/
const getPredictionDetailsFromOutcomes = (outcomes: any): { prediction: string; odds: number } => {
  if (!outcomes) return { prediction: "N/A", odds: 1.0 };

  // Prefer doubleChance / over / btts preferences depending on structure
  // If doubleChance exists and is clearly > other values, use it as textual label
  if (outcomes.doubleChance) {
    const dc = outcomes.doubleChance;
    // choose the largest DC value label
    const pairs: Array<[string, number]> = [
      ["Home or Draw", dc.homeOrDraw ?? 0],
      ["Home or Away", dc.homeOrAway ?? 0],
      ["Draw or Away", dc.drawOrAway ?? 0],
    ];
    pairs.sort((a, b) => b[1] - a[1]);
    const max = pairs[0];
    if (max[1] > 0) return { prediction: max[0], odds: Number((1 / max[1]).toFixed(2)) || max[1] };
  }

  if (outcomes.oneXTwo) {
    const { home = 0, draw = 0, away = 0 } = outcomes.oneXTwo;
    const max = Math.max(home, draw, away);
    if (max === home) return { prediction: "Home Win", odds: home };
    if (max === away) return { prediction: "Away Win", odds: away };
    return { prediction: "Draw", odds: draw };
  }

  // fallback to common overs or btts
  if (outcomes.over25) return { prediction: "Over 2.5", odds: outcomes.over25 };
  if (outcomes.bttsYes) return { prediction: "Both Teams To Score", odds: outcomes.bttsYes };

  return { prediction: "N/A", odds: 1.0 };
};

const normalizePrediction = (rawPrediction: any): Prediction | null => {
  if (!rawPrediction) return null;

  // The match data might be nested in matchId or be the root object
  const matchData = rawPrediction.matchId && typeof rawPrediction.matchId === "object" ? rawPrediction.matchId : rawPrediction;
  if (!matchData || !matchData.homeTeam || !matchData.awayTeam) return null;

  const outcomes = rawPrediction.outcomes || rawPrediction.outcomes?.oneXTwo ? rawPrediction.outcomes : rawPrediction.outcomes;
  const details = getPredictionDetailsFromOutcomes(rawPrediction.outcomes ?? {});

  return {
    id: rawPrediction._id || rawPrediction.id || `${matchData._id}-${rawPrediction.bucket}`,
    matchId: matchData._id || matchData.id,
    prediction: rawPrediction.prediction || details.prediction,
    odds: typeof rawPrediction.odds === "number" ? rawPrediction.odds : details.odds,
    confidence: rawPrediction.confidence,
    bucket: rawPrediction.bucket || rawPrediction.type || "unknown",
    status: rawPrediction.status || "pending",
    is_vip: !!rawPrediction.is_vip,
    analysis: rawPrediction.analysis,
    outcomes: rawPrediction.outcomes || rawPrediction.outcomeData || null,

    // flattened match context
    homeTeam: matchData.homeTeam,
    awayTeam: matchData.awayTeam,
    league: matchData.league || matchData.competition || "Unknown League",
    matchDateUtc: matchData.matchDateUtc || matchData.date || matchData.datetime,
  } as Prediction;
};

const normalizeMatch = (rawMatch: any): Match | null => {
  if (!rawMatch) return null;
  // Ensure id consistency
  const id = rawMatch._id || rawMatch.id;

  // normalize nested predictions if any
  const nestedPredictions = (rawMatch.predictions || [])
    .map(normalizePrediction)
    .filter((p): p is Prediction => p !== null);

  // If there's top-level `prediction` object (some results endpoints)
  let topLevelPrediction = null;
  if (rawMatch.prediction) {
    topLevelPrediction = normalizePrediction({ ...rawMatch.prediction, matchId: rawMatch });
  }

  return {
    id,
    league: rawMatch.league || rawMatch.competition || "Unknown League",
    matchDateUtc: rawMatch.matchDateUtc || rawMatch.date || rawMatch.datetime,
    status: rawMatch.status || rawMatch.matchStatus || "scheduled",
    homeTeam: rawMatch.homeTeam,
    awayTeam: rawMatch.awayTeam,
    scores: rawMatch.score || rawMatch.scores || null,
    predictions: topLevelPrediction ? [topLevelPrediction, ...nestedPredictions] : nestedPredictions,
    prediction: topLevelPrediction || undefined,
    outcome: rawMatch.outcome || undefined,
  } as Match;
};

/** API functions **/

export const getPredictionsByBucket = async (bucket: string): Promise<Prediction[]> => {
  try {
    const res = await api.get(`/predictions/${bucket}`);
    // API returns groups per-match (array of arrays) or a flat list; handle both.
    const body = res.data ?? [];
    let list: any[] = [];
    if (Array.isArray(body)) {
      if (body.length > 0 && Array.isArray(body[0])) {
        // [[p1,p2],[p3]] -> flatten
        list = body.flat();
      } else {
        list = body;
      }
    } else if (typeof body === "object") {
      list = [body];
    }

    return list.map(normalizePrediction).filter((p): p is Prediction => p !== null);
  } catch (err) {
    console.error("getPredictionsByBucket error:", err);
    return [];
  }
};

export const getResults = async (): Promise<Match[]> => {
  try {
    const res = await api.get("/results");
    const body = res.data ?? [];
    return (Array.isArray(body) ? body : [body]).map(normalizeMatch).filter((m): m is Match => m !== null);
  } catch (err) {
    console.error("getResults error:", err);
    return [];
  }
};

export const getUpcomingMatches = async (): Promise<Match[]> => {
  try {
    const res = await api.get("/matches/upcoming");
    const body = res.data ?? [];
    return (Array.isArray(body) ? body : [body]).map(normalizeMatch).filter((m): m is Match => m !== null);
  } catch (err) {
    console.error("getUpcomingMatches error:", err);
    return [];
  }
};

export const getMatchSummary = async (matchId: string): Promise<Match | null> => {
  try {
    const res = await api.get(`/summary/${matchId}`);
    return normalizeMatch(res.data);
  } catch (err) {
    console.error("getMatchSummary error:", err);
    return null;
  }
};
