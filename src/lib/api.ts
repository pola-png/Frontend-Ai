import axios from 'axios';
import type { Match, Result, DashboardData } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// --- Dashboard ---
export const getDashboard = async (): Promise<DashboardData> => {
  try {
    const res = await api.get('/dashboard');
    return res.data || { 
      upcomingMatches: [], 
      recentResults: [], 
      bucketCounts: {},
      vipPredictions: [],
      twoOddsPredictions: [],
      fiveOddsPredictions: [],
      bigOddsPredictions: []
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    // Return a default structure on error to prevent crashes
    return { 
      upcomingMatches: [], 
      recentResults: [], 
      bucketCounts: {},
      vipPredictions: [],
      twoOddsPredictions: [],
      fiveOddsPredictions: [],
      bigOddsPredictions: []
    };
  }
};

// --- Predictions by bucket ---
export const getPredictionsByBucket = async (bucket: string): Promise<Match[]> => {
  try {
    const res = await api.get(`/predictions/${bucket}`);
    return res.data || [];
  } catch (error) {
    console.error(`Failed to fetch predictions for bucket ${bucket}:`, error);
    return [];
  }
};

// --- Results ---
export const getResults = async (): Promise<Result[]> => {
  try {
    const res = await api.get('/results');
    return res.data || [];
  } catch (error) {
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
    const res = await api.get('/matches');
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch upcoming matches:", error);
    return [];
  }
};
