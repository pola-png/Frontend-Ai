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
const getPredictionDetailsFromOutcomes = (
  outcomes: any
): { prediction: string; odds: number } => {
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
 * Normalize a raw prediction into a UI-friendly Prediction object.
 */
const normalizePrediction = (rawPrediction: any): Prediction | null => {
  const matchData =
    rawPrediction.matchId && typeof rawPrediction.matchId === 'object'
      ? rawPrediction.matchId
      : rawPrediction;

  if (!matchData || !matchData.homeTeam || !matchData.awayTeam) {
    return null;
  }

  const { prediction, odds } = getPredictionDetailsFromOutcomes(
    rawPrediction.outcomes
  );

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

    // Flatten match details
    matchId: matchData._id,
    homeTeam: matchData.homeTeam,
    awayTeam: matchData.awayTeam,
    league: matchData.league || 'Unknown League',
    matchDateUtc: matchData.matchDateUtc,
  };
};

/**
 * Normalize a raw match object.
 */
const normalizeMatch = (rawMatch: any): Match | null => {
  if (!rawMatch || !rawMatch._id || !rawMatch.homeTeam || !rawMatch.awayTeam) {
    return null;
  }

  let topLevelPrediction: Prediction | null = null;
  if (rawMatch.prediction) {
    const predWithContext = { ...rawMatch.prediction, ...rawMatch };
    topLevelPrediction = normalizePrediction(predWithContext);
  }

  const nestedPredictions = (rawMatch.predictions || [])
    .map(normalizePrediction)
    .filter((p): p is Prediction => p !== null);

  const allPredictions = topLevelPrediction
    ? [topLevelPrediction, ...nestedPredictions]
    : nestedPredictions;

  return {
    id: rawMatch._id,
    league: rawMatch.league,
    matchDateUtc: rawMatch.matchDateUtc,
    status: rawMatch.status,
    homeTeam: rawMatch.homeTeam,
    awayTeam: rawMatch.awayTeam,
    scores: rawMatch.scores,
    predictions: allPredictions,
    prediction: topLevelPrediction || undefined,
    outcome: rawMatch.outcome,
  };
};

/**
 * Fetch predictions by bucket.
 */
export const getPredictionsByBucket = async (
  bucket: string
): Promise<Prediction[]> => {
  try {
    const res = await api.get(`/predictions/${bucket}`);
    const predictionGroups: any[][] = res.data?.data || [];

    if (!Array.isArray(predictionGroups)) return [];

    return predictionGroups
      .flat()
      .map(normalizePrediction)
      .filter((p): p is Prediction => p !== null);
  } catch (error) {
    console.error(`Failed to fetch predictions for bucket ${bucket}:`, error);
    return [];
  }
};

/**
 * Fetch finished match results.
 */
export const getResults = async (): Promise<Match[]> => {
  try {
    const res = await api.get('/results');
    const rawMatches: any[] = res.data?.data || [];
    return rawMatches.map(normalizeMatch).filter((m): m is Match => m !== null);
  } catch (error) {
    console.error('Failed to fetch results:', error);
    return [];
  }
};

/**
 * Fetch upcoming matches.
 */
export const getUpcomingMatches = async (): Promise<Match[]> => {
  try {
    const res = await api.get('/matches/upcoming');
    const rawMatches: any[] = res.data?.data || [];
    return rawMatches.map(normalizeMatch).filter((m): m is Match => m !== null);
  } catch (error) {
    console.error('Failed to fetch upcoming matches:', error);
    return [];
  }
};

/**
 * Fetch match summary.
 */
export const getMatchSummary = async (
  matchId: string
): Promise<Match | null> => {
  try {
    const res = await api.get(`/summary/${matchId}`);
    return normalizeMatch(res.data?.data);
  } catch (error) {
    console.error(`Failed to fetch summary for match ${matchId}:`, error);
    return null;
  }
};
