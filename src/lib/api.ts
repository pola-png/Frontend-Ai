// src/lib/api.ts
import axios from 'axios';
import type { Prediction } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Fetch predictions by bucket and flatten them from match objects
export const getPredictionsByBucket = async (bucket: string): Promise<Prediction[]> => {
  try {
    const { data } = await api.get(`/predictions/${bucket}`);

    const predictions: Prediction[] = [];
    data.forEach((match: any) => {
      if (match.predictions && match.predictions.length > 0) {
        match.predictions.forEach((pred: any) => {
          if (pred.bucket === bucket) {
            predictions.push({
              id: pred.id,
              matchId: match.id,
              prediction: pred.prediction || '-', // default if missing
              odds: pred.odds || 0,
              confidence: pred.confidence,
              bucket: pred.bucket,
              status: pred.status,
              is_vip: pred.bucket === 'vip',
              outcomes: pred.outcomes,
              analysis: pred.analysis,
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
              league: match.league || 'Unknown League',
              matchDateUtc: match.date || match.matchDateUtc,
            });
          }
        });
      }
    });

    return predictions;
  } catch (err) {
    console.error('Error fetching predictions:', err);
    return [];
  }
};

// Existing match APIs
export const getUpcomingMatches = async () => {
  try {
    const { data } = await api.get('/matches/upcoming');
    return data;
  } catch (err) {
    console.error('Error fetching upcoming matches:', err);
    return [];
  }
};

export const getResults = async () => {
  try {
    const { data } = await api.get('/matches/results');
    return data;
  } catch (err) {
    console.error('Error fetching results:', err);
    return [];
  }
};
