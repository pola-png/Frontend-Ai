import type { Prediction, Match, Result } from './types';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

async function fetchData<T>(endpoint: string): Promise<T> {
  try {
    if (!api.defaults.baseURL) {
      console.warn('API baseURL is not set. Returning empty array/object.');
      // Based on what different endpoints return, we might need a more flexible default
      return Array.isArray([]) ? ([] as T) : ({} as T) ;
    }
    const response = await api.get(endpoint);
    return response.data || ([] as T);
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    // Return a sensible default based on expected type
    return Array.isArray([]) ? ([] as T) : ({} as T);
  }
}

// Specific API helpers based on the backend routes
export const getDashboard = () => fetchData<{ upcomingMatches: Match[], recentResults: Result[], bucketCounts: Record<string, number> }>("/api/dashboard");
export const getPredictionsByBucket = (bucket: string) => fetchData<Prediction[]>(`/api/predictions/${bucket}`);
export const getResults = () => fetchData<Result[]>("/api/results");
export const getMatchSummary = (id: string) => fetchData<{ summary: string }>(`/api/match/${id}/summary`);
