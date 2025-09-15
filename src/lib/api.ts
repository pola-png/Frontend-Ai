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
  
  const flatPredictions: Prediction[] = [];
  
  // The API returns an array of arrays (groups of predictions per match)
  predictionGroups.forEach(group => {
    if (Array.isArray(group)) {
      group.forEach(p => {
        // The match data (teams, date, etc.) is in the populated `matchId` object.
        const matchData = p.matchId;

        // Ensure matchData is a valid object before proceeding
        if (typeof matchData === 'object' && matchData !== null && matchData.homeTeam && matchData.awayTeam) {
            flatPredictions.push({
              ...p,
              // Hoist the match details to the top level for easier access in components.
              matchId: matchData._id, // Keep the original matchId as a string
              homeTeam: typeof matchData.homeTeam === 'object' ? matchData.homeTeam : { name: matchData.homeTeam },
              awayTeam: typeof matchData.awayTeam === 'object' ? matchData.awayTeam : { name: matchData.awayTeam },
              league: matchData.league,
              fixture: matchData.fixture,
              matchDateUtc: matchData.matchDateUtc,
            });
        }
      });
    }
  });

  return flatPredictions;
};

// --- Predictions by bucket ---
export const getPredictionsByBucket = async (bucket: string): Promise<Prediction[]> => {
  try {
    const res = await api.get(`/predictions/${bucket}`);
    // The response is an array of arrays, e.g., [[pred1, pred2], [pred3]]
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
