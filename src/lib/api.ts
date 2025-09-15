import axios from "axios";
import type { Match, Result, DashboardData } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

// --- Dashboard ---
export const getDashboard = async (): Promise<DashboardData> => {
  const res = await api.get("/dashboard");
  return res.data || { 
    upcomingMatches: [], 
    recentResults: [], 
    bucketCounts: {},
    vipPredictions: [],
    twoOddsPredictions: [],
    fiveOddsPredictions: [],
    bigOddsPredictions: []
  };
};

// --- Predictions by bucket ---
export const getPredictionsByBucket = async (bucket: string): Promise<Match[]> => {
  const res = await api.get(`/predictions/${bucket}`);
  return res.data || [];
};

// --- Results ---
export const getResults = async (): Promise<Result[]> => {
  const res = await api.get("/results");
  return res.data || [];
};

// --- Match Summary ---
export const getMatchSummary = async (matchId: string): Promise<{ summary: string }> => {
  const res = await api.get(`/summary/${matchId}`);
  return res.data || { summary: '' };
};
