import axios from "axios";
import type { Match, Result, DashboardData } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

const fetchData = async <T>(endpoint: string): Promise<T | []> => {
  try {
    if (!api.defaults.baseURL) {
      console.warn('API baseURL is not set. Returning empty array.');
      return [];
    }
    const response = await api.get(endpoint);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
  }
}

// --- Dashboard ---
export const getDashboard = async (): Promise<DashboardData> => {
  const res = await api.get("/api/dashboard");
  return res.data || { upcomingMatches: [], recentResults: [], bucketCounts: {} };
};

// --- Predictions by bucket ---
export const getPredictionsByBucket = async (bucket: string): Promise<Match[]> => {
  const res = await api.get(`/api/predictions/${bucket}`);
  return res.data || [];
};

// --- Results ---
export const getResults = async (): Promise<Result[]> => {
  const res = await api.get("/api/results");
  return res.data || [];
};

// --- Match Summary ---
export const getMatchSummary = async (matchId: string): Promise<{ summary: string }> => {
  const res = await api.get(`/api/summary/${matchId}`);
  return res.data || { summary: '' };
};
