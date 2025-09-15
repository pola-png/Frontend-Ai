import axios from 'axios';
import type { Match, Prediction } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Normalization function to add match context to each prediction
const normalizePredictions = (predictionGroups: any[][]): Prediction[] => {
  if (!Array.isArray(predictionGroups)) return [];
  
  const flatPredictions: Prediction[] = [];
  
  predictionGroups.forEach(group => {
    if (Array.isArray(group) && group.length > 0) {
      // All predictions in a group belong to the same match.
      // We can take the match details from the first prediction's populated matchId.
      const matchData = group[0].matchId;
      if (typeof matchData === 'object' && matchData !== null) {
        group.forEach(p => {
          flatPredictions.push({
            ...p,
            matchDateUtc: matchData.matchDateUtc,
            homeTeam: matchData.homeTeam,
            awayTeam: matchData.awayTeam,
            league: matchData.league,
            fixture: matchData.fixture,
          });
        });
      }
    }
  });

  return flatPredictions;
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
// This is not used yet, but is here for future use.
export const getMatchSummary = async (matchId: string): Promise<Match | null> => {
  try {
    const res = await api.get(`/summary/${matchId}`);
    return res.data || null;
  } catch (error) {
    console.error(`Failed to fetch summary for match ${matchId}:`, error);
    return null;
  }
};
