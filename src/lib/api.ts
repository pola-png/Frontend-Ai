import type { Prediction, Match, Result } from './types';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

async function fetchData<T>(endpoint: string): Promise<T[]> {
  try {
    if (!api.defaults.baseURL) {
      console.warn("API baseURL is not set. Returning empty array.");
      return [];
    }
    const response = await api.get(endpoint);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    // Return an empty array to prevent the app from crashing on API errors.
    return [];
  }
}

export const getPredictions = () => fetchData<Prediction>('/api/predictions');
export const getMatches = () => fetchData<Match>('/api/matches');
export const getResults = () => fetchData<Result>('/api/results');
