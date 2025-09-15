import axios from 'axios';
import type { Match, Prediction } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Normalizes predictions from endpoints where match data is nested inside `matchId`.
 * This function flattens the structure so UI components can easily access match details.
 * It also determines the primary prediction text and odds from the `oneXTwo` outcomes.
 */
const normalizePredictions = (predictionGroups: any[][]): Prediction[] => {
  if (!Array.isArray(predictionGroups)) {
    console.error("normalizePredictions expected an array, but received:", predictionGroups);
    return [];
  }

  return predictionGroups.flat().map(p => {
    if (!p || !p.matchId || typeof p.matchId !== 'object') {
      console.warn("Skipping invalid prediction object:", p);
      return null;
    }

    const match = p.matchId;
    const homeTeam = typeof match.homeTeam === 'object' ? match.homeTeam : { name: match.homeTeam || 'Home' };
    const awayTeam = typeof match.awayTeam === 'object' ? match.awayTeam : { name: match.awayTeam || 'Away' };
    
    let textualPrediction = p.prediction;
    let predictionOdds = p.odds;

    // Determine the textual prediction and odds from oneXTwo if not explicitly present
    if ((!textualPrediction || !predictionOdds) && p.outcomes?.oneXTwo) {
      const { home, draw, away } = p.outcomes.oneXTwo;
      // Find the highest probability to determine the prediction
      const maxOddValue = Math.max(home, draw, away);
      
      if (maxOddValue === home) {
        textualPrediction = 'Home Win';
        predictionOdds = home;
      } else if (maxOddValue === away) {
        textualPrediction = 'Away Win';
        predictionOdds = away;
      } else {
        textualPrediction = 'Draw';
        predictionOdds = draw;
      }
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
    return (res.data || []).map((match: any) => ({
      ...match,
      // Ensure predictions within a match have a determined textual prediction
      predictions: (match.predictions || []).map((p: any) => {
        let textualPrediction = p.prediction;
        if (!textualPrediction && p.outcomes?.oneXTwo) {
          const { home, draw, away } = p.outcomes.oneXTwo;
          const maxOddValue = Math.max(home, draw, away);
          if (maxOddValue === home) textualPrediction = 'Home Win';
          else if (maxOddValue === away) textualPrediction = 'Away Win';
          else textualPrediction = 'Draw';
        }
        return { ...p, prediction: textualPrediction };
      })
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
