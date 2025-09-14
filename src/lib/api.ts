import type { Prediction, Match, Result } from './types';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

async function fetchData<T>(endpoint: string, mockData: T): Promise<T> {
  try {
    // We add a check for the baseURL to avoid making requests to an undefined URL
    if (!api.defaults.baseURL) {
      console.warn("API baseURL is not set. Returning mock data.");
      return mockData;
    }
    const response = await api.get(endpoint);
    // The API seems to wrap data in a `data` property
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    // In a real-world scenario, you might want to handle this more gracefully
    // For now, we return mock data to prevent the app from crashing.
    return mockData;
  }
}

export const getPredictions = () => fetchData<Prediction[]>('/api/predictions', []);
export const getMatches = () => fetchData<Match[]>('/api/matches', []);
export const getResults = () => fetchData<Result[]>('/api/results', []);
