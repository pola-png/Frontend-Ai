import type { Prediction, Match, Result } from './types';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

async function fetchData<T>(endpoint: string, mockData: T): Promise<T> {
  try {
    const response = await api.get(endpoint);
    // The API seems to wrap data in a `data` property
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    // In a real-world scenario, you might want to handle this more gracefully
    // For now, we return an empty array to prevent the app from crashing.
    return [] as T;
  }
}

export const getPredictions = () => fetchData<Prediction[]>('/api/predictions', []);
export const getMatches = () => fetchData<Match[]>('/api/matches', []);
export const getResults = () => fetchData<Result[]>('/api/results', []);
