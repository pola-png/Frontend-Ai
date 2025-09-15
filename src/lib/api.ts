import axios from 'axios';
import type { Match, Prediction } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Normalizes the predictions response from the API. The API returns predictions
 * grouped by match, which is an array of arrays. This function flattens the groups
 * and, crucially, lifts the nested match details (like teams and date) from the
`* matchId` object to the top level of each prediction object for easier use in UI components.
 */
const normalizePredictions = (predictionGroups: any[][]): Prediction[] => {
  if (!Array.isArray(predictionGroups)) {
    console.error("normalizePredictions expected an array, but received:", predictionGroups);
    return [];
  }

  return predictionGroups.flat().map(p => {
    if (!p || !p.matchId) return null;

    const match = p.matchId;
    const homeTeam = typeof match.homeTeam === 'object' ? match.homeTeam : { name: match.homeTeam || 'Home' };
    const awayTeam = typeof match.awayTeam === 'object' ? match.awayTeam : { name: match.awayTeam || 'Away' };
    
    // Determine the textual prediction if not present
    let textualPrediction = p.prediction;
    if (!textualPrediction && p.outcomes?.oneXTwo) {
      const { home, draw, away } = p.outcomes.oneXTwo;
      const maxOdd = Math.max(home, draw, away);
      if (maxOdd === home) textualPrediction = 'Home Win';
      else if (maxOdd === away) textualPrediction = 'Away Win';
      else textualPrediction = 'Draw';
    }

    // Determine the odds if not present
    let predictionOdds = p.odds;
    if (!predictionOdds && p.outcomes?.oneXTwo) {
        const { home, draw, away } = p.outcomes.oneXTwo;
        predictionOdds = Math.max(home, draw, away);
    }


    return {
      _id: p._id,
      prediction: textualPrediction,
      bucket: p.bucket,
      confidence: p.confidence,
      odds: predictionOdds,
      outcomes: p.outcomes,
      status: p.status,
      is_vip: p.is_vip,
      analysis: p.analysis,

      // --- Flattened from p.matchId ---
      matchId: match._id,
      homeTeam: homeTeam,
      awayTeam: awayTeam,
      league: match.league,
      fixture: match.fixture,
      matchDateUtc: match.matchDateUtc,
    };
  }).filter((p): p is Prediction => p !== null);
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
