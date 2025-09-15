import axios from 'axios';
import type { Match, Prediction } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Normalization function to flatten the grouped prediction response and
// lift the match details from the populated `matchId` object to the top level of each prediction.
const normalizePredictions = (predictionGroups: any[][]): Prediction[] => {
  if (!Array.isArray(predictionGroups)) return [];
  
  // The API returns an array of arrays (groups of predictions per match)
  return predictionGroups.flat().map(p => {
    const match = p.matchId || {};
    return {
      _id: p._id,
      prediction: p.prediction,
      bucket: p.bucket,
      confidence: p.confidence,
      odds: p.odds,
      outcomes: p.outcomes,
      status: p.status,
      is_vip: p.is_vip,
      analysis: p.analysis,

      // Flatten match info from the nested matchId object
      matchId: match._id,
      homeTeam: typeof match.homeTeam === 'object' ? match.homeTeam : { name: match.homeTeam },
      awayTeam: typeof match.awayTeam === 'object' ? match.awayTeam : { name: match.awayTeam },
      league: match.league,
      fixture: match.fixture,
      matchDateUtc: match.matchDateUtc,
    };
  });
};

// --- Predictions by bucket ---
export const getPredictionsByBucket = async (bucket: string): Promise<Prediction[]> => {
  try {
    const res = await api.get(`/predictions/${bucket}`);
    const predictionGroups: any[][] = res.data || [];
    return normalizePredictions(predictionGroups);
  } catch (error) {
    console.error(`Failed to fetch predictions for bucket ${bucket}:`, error);
    return [];
  }
};

// --- Results ---
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
export const getUpcomingMatches = async (): Promise<Match[]> => {
  try {
    const res = await api.get('/matches/upcoming');
    return res.data || [];
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
