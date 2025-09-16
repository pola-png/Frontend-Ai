import axios from 'axios';
import type { Match, Prediction } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Given a prediction's `oneXTwo` outcomes, determines the textual prediction
 * (e.g., "Home Win") and the corresponding odds value.
 */
const getPredictionDetailsFromOutcomes = (outcomes: any): { prediction: string; odds: number } => {
  if (!outcomes?.oneXTwo) {
    return { prediction: 'N/A', odds: 1.0 };
  }
  const { home, draw, away } = outcomes.oneXTwo;
  const maxOddValue = Math.max(home, draw, away);

  if (maxOddValue === home) return { prediction: 'Home Win', odds: home };
  if (maxOddValue === away) return { prediction: 'Away Win', odds: away };
  return { prediction: 'Draw', odds: draw };
};

/**
 * Normalizes a raw prediction object from the API into a flattened,
 * UI-friendly `Prediction` object. It extracts nested match details.
 */
const normalizePrediction = (rawPrediction: any): Prediction | null => {
  if (!rawPrediction || !rawPrediction.matchId || typeof rawPrediction.matchId !== 'object') {
    // console.warn("Skipping invalid raw prediction:", rawPrediction);
    return null;
  }

  const match = rawPrediction.matchId;
  const { prediction, odds } = getPredictionDetailsFromOutcomes(rawPrediction.outcomes);

  return {
    _id: rawPrediction._id,
    prediction: rawPrediction.prediction || prediction,
    odds: rawPrediction.odds || odds,
    bucket: rawPrediction.bucket,
    confidence: rawPrediction.confidence,
    outcomes: rawPrediction.outcomes,
    status: rawPrediction.status || 'pending',
    is_vip: rawPrediction.is_vip,
    analysis: rawPrediction.analysis,

    // --- Flattened from rawPrediction.matchId ---
    matchId: match._id,
    homeTeam: match.homeTeam || { name: 'Home' },
    awayTeam: match.awayTeam || { name: 'Away' },
    league: match.league || 'Unknown League',
    matchDateUtc: match.matchDateUtc,
  };
};


// --- Predictions by bucket ---
// Fetches data from endpoints like `/predictions/vip`, which return `PredictionGroup[][]`
export const getPredictionsByBucket = async (bucket: string): Promise<Prediction[]> => {
  try {
    const res = await api.get(`/predictions/${bucket}`);
    const predictionGroups: any[][] = res.data || [];
    
    if (!Array.isArray(predictionGroups)) return [];
    
    return predictionGroups
      .flat() // [[p1, p2], [p3]] -> [p1, p2, p3]
      .map(normalizePrediction)
      .filter((p): p is Prediction => p !== null);
  } catch (error) {
    console.error(`Failed to fetch predictions for bucket ${bucket}:`, error);
    return [];
  }
};

// --- Results ---
// Fetches data from `/results`, which returns `Match[]`
export const getResults = async (): Promise<Match[]> => {
  try {
    const res = await api.get('/results');
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch results:", error);
    return [];
  }
};


// --- Upcoming Matches ---
// Fetches data from `/matches/upcoming`, which returns `Match[]`
export const getUpcomingMatches = async (): Promise<Match[]> => {
  try {
    const res = await api.get('/matches/upcoming');
    const matches: any[] = res.data || [];
    return matches.map(match => ({
      ...match,
      // Ensure nested predictions are also normalized for consistency
      predictions: (match.predictions || []).map((p: any) => {
         const { prediction, odds } = getPredictionDetailsFromOutcomes(p.outcomes);
         return { ...p, prediction, odds };
      }),
    }));
  } catch (error) {
    console.error("Failed to fetch upcoming matches:", error);
    return [];
  }
};


// --- Match Summary ---
export const getMatchSummary = async (matchId: string): Promise<Match | null> => {
  try {
    const res = await api.get(`/summary/${matchId}`);
    return res.data || null;
  } catch (error) {
    console.error(`Failed to fetch summary for match ${matchId}:`, error);
    return null;
  }
};
