import axios from 'axios';
import type { Match, Prediction } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// --- Predictions by bucket ---
export const getPredictionsByBucket = async (bucket: string): Promise<Prediction[][]> => {
  try {
    const res = await api.get(`/predictions/${bucket}`);
    return res.data || [];
  } catch (error) {
    console.error(`Failed to fetch predictions for bucket ${bucket}:`, error);
    return [];
  }
};

// --- Results ---
export const getResults = async (): Promise<Match[]> => {
  try {
    const res = await api.get('/results');
    // The backend seems to be returning the prediction object directly.
    // The type `Match` expects `prediction` to be an object.
    return (res.data || []).map((m: any) => ({
      ...m,
      date: m.matchDateUtc,
      prediction: m.prediction ? {
        ...m.prediction,
        prediction: m.prediction.prediction,
        odds: m.prediction.odds,
        status: m.prediction.status,
      } : undefined
    }));
  } catch (error) {
    console.error("Failed to fetch results:", error);
    return [];
  }
};


// --- Match Summary ---
export const getMatchSummary = async (matchId: string): Promise<Match | null> => {
  try {
    const res = await api.get(`/match/${matchId}`);
    return res.data ? { ...res.data, date: res.data.matchDateUtc } : null;
  } catch (error) {
    console.error(`Failed to fetch summary for match ${matchId}:`, error);
    return null;
  }
};


// --- Upcoming Matches ---
export const getUpcomingMatches = async (): Promise<Match[]> => {
  try {
    const res = await api.get('/matches/upcoming');
    return (res.data || []).map((m: any) => ({ ...m, date: m.matchDateUtc }));
  } catch (error) {
    console.error("Failed to fetch upcoming matches:", error);
    return [];
  }
};
