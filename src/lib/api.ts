import axios from 'axios';
import type { Match, Prediction, Team } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Given a prediction's `oneXTwo` outcomes, determines the textual prediction
 * (e.g., "Home Win") and the corresponding odds value.
 * @param outcomes - The `outcomes` object from a raw prediction.
 * @returns An object with the determined `prediction` string and `odds` number.
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
 * @param rawPrediction - The raw prediction object from the API, which may have nested match data.
 * @returns A normalized `Prediction` object, or `null` if the input is invalid.
 */
const normalizePrediction = (rawPrediction: any): Prediction | null => {
  // The match data can either be at the root (for /results) or nested in matchId (for /predictions)
  const matchData = rawPrediction.matchId && typeof rawPrediction.matchId === 'object' ? rawPrediction.matchId : rawPrediction;

  if (!matchData || !matchData.homeTeam || !matchData.awayTeam) {
    return null;
  }
  
  const { prediction, odds } = getPredictionDetailsFromOutcomes(rawPrediction.outcomes);

  return {
    id: rawPrediction._id,
    prediction: rawPrediction.prediction || prediction,
    odds: rawPrediction.odds || odds,
    bucket: rawPrediction.bucket,
    confidence: rawPrediction.confidence,
    outcomes: rawPrediction.outcomes,
    status: rawPrediction.status || 'pending',
    is_vip: rawPrediction.is_vip,
    analysis: rawPrediction.analysis,

    // --- Flattened from matchData ---
    matchId: matchData._id,
    homeTeam: matchData.homeTeam,
    awayTeam: matchData.awayTeam,
    league: matchData.league || 'Unknown League',
    matchDateUtc: matchData.matchDateUtc,
  };
};


/**
 * Normalizes a raw match object from the API into a UI-friendly `Match` object.
 * It ensures nested predictions are also normalized.
 * @param rawMatch - The raw match object from the API.
 * @returns A normalized `Match` object, or `null` if the input is invalid.
 */
const normalizeMatch = (rawMatch: any): Match | null => {
  if (!rawMatch || !rawMatch._id || !rawMatch.homeTeam || !rawMatch.awayTeam) {
    return null;
  }
  
  // For results, the main prediction is at the top level.
  // We normalize it and put it into an array for consistency.
  let topLevelPrediction: Prediction | null = null;
  if (rawMatch.prediction) {
    // Attach the match context to the prediction before normalizing
    const predWithContext = { ...rawMatch.prediction, ...rawMatch };
    topLevelPrediction = normalizePrediction(predWithContext);
  }

  // Also normalize any predictions in the nested array
  const nestedPredictions = (rawMatch.predictions || [])
    .map(normalizePrediction)
    .filter((p): p is Prediction => p !== null);

  const allPredictions = topLevelPrediction ? [topLevelPrediction, ...nestedPredictions] : nestedPredictions;

  return {
    id: rawMatch._id,
    league: rawMatch.league,
    matchDateUtc: rawMatch.matchDateUtc,
    status: rawMatch.status,
    homeTeam: rawMatch.homeTeam,
    awayTeam: rawMatch.awayTeam,
    scores: rawMatch.scores,
    predictions: allPredictions,
    prediction: topLevelPrediction || undefined, // Keep single prediction for ResultCard
    outcome: rawMatch.outcome,
  };
};

/**
 * Fetches predictions for a specific bucket (e.g., 'vip', '2odds').
 * The API returns groups of predictions per match, so we flatten them.
 * @param bucket - The prediction bucket to fetch.
 * @returns A promise that resolves to an array of normalized `Prediction` objects.
 */
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

/**
 * Fetches finished match results.
 * @returns A promise that resolves to an array of normalized `Match` objects.
 */
export const getResults = async (): Promise<Match[]> => {
  try {
    const res = await api.get('/results');
    const rawMatches: any[] = res.data || [];
    return rawMatches
      .map(normalizeMatch)
      .filter((m): m is Match => m !== null);
  } catch (error) {
    console.error("Failed to fetch results:", error);
    return [];
  }
};

/**
 * Fetches upcoming matches.
 * @returns A promise that resolves to an array of normalized `Match` objects.
 */
export const getUpcomingMatches = async (): Promise<Match[]> => {
  try {
    const res = await api.get('/matches/upcoming');
    const rawMatches: any[] = res.data || [];
    return rawMatches
      .map(normalizeMatch)
      .filter((m): m is Match => m !== null);
  } catch (error) {
    console.error("Failed to fetch upcoming matches:", error);
    return [];
  }
};

/**
 * Fetches a single match summary.
 * @param matchId - The ID of the match to fetch.
 * @returns A promise that resolves to a single normalized `Match` object or null.
 */
export const getMatchSummary = async (matchId: string): Promise<Match | null> => {
  try {
    const res = await api.get(`/summary/${matchId}`);
    return normalizeMatch(res.data);
  } catch (error) {
    console.error(`Failed to fetch summary for match ${matchId}:`, error);
    return null;
  }
};
