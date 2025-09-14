import type { Prediction, Match, Result } from './types';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

async function fetchData<T>(endpoint: string): Promise<T> {
  try {
    if (!api.defaults.baseURL) {
      console.warn('API baseURL is not set. Returning empty array.');
      return [] as T;
    }
    const response = await api.get(endpoint);
    return response.data || ([] as T);
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    // Return an empty array to prevent the app from crashing on API errors.
    return [] as T;
  }
}

export const getDashboard = () => fetchData<any>('/api/dashboard');

export const getPredictionsByBucket = (bucket: string) => fetchData<Prediction[]>(`/api/predictions/${bucket}`);

export const getResults = () => fetchData<Result[]>('/api/results');

export const getMatchSummary = (id: string) => fetchData<any>(`/api/match/${id}/summary`);

// The following functions are now potentially obsolete if getDashboard provides all the necessary data.
// They can be kept for pages that might still use them or removed if no longer needed.
export const getPredictions = () => fetchData<Prediction[]>('/api/predictions');
export const getMatches = () => fetchData<Match[]>('/api/matches');
