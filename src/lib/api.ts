import axios from 'axios';
import type { Match } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// --- Predictions by bucket ---
export const getPredictionsByBucket = async (bucket: string): Promise<Match[]> => {
  try {
    const res = await api.get(`/predictions/${bucket}`);
    return (res.data || []).map((m: any) => ({ ...m, date: m.matchDateUtc }));
  } catch (error) {
    console.error(`Failed to fetch predictions for bucket ${bucket}:`, error);
    return [];
  }
};

// --- Results ---
export const getResults = async (): Promise<Match[]> => {
  try {
    const res = await api.get('/results');
    return (res.data || []).map((m: any) => ({ ...m, date: m.matchDateUtc }));
  } catch (error)
 {
    console.error("Failed to fetch results:", error);
    return [];
  }
};

// --- Match Summary ---
export const getMatchSummary = async (matchId: string): Promise<{ summary: string }> => {
  try {
    const res = await api.get(`/summary/${matchId}`);
    return res.data || { summary: '' };
  } catch (error) {
    console.error(`Failed to fetch summary for match ${matchId}:`, error);
    return { summary: '' };
  }
};

// --- Upcoming Matches ---
export const getUpcomingMatches = async (): Promise<Match[]> => {
  try {
    const res = await api.get('/upcoming');
    return (res.data || []).map((m: any) => ({ ...m, date: m.matchDateUtc }));
  } catch (error) {
    console.error("Failed to fetch upcoming matches:", error);
    return [];
  }
};
