'use client';

import { useState, useEffect } from 'react';
import { getPredictionsByBucket } from '@/lib/api';
import { PredictionCard } from '@/components/shared/PredictionCard';
import { Prediction } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Gem } from 'lucide-react';

export default function Value5OddsPredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[][]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        const data = await getPredictionsByBucket('value5');
        const sortedPredictions = (data || []).sort(
          (a, b) => new Date(a.matchDateUtc).getTime() - new Date(b.matchDateUtc).getTime()
        );

        const groups: Prediction[][] = [];
        let temp: Prediction[] = [];
        sortedPredictions.forEach((pred, i) => {
          temp.push(pred);
          if (temp.length === 3 || i === sortedPredictions.length - 1) {
            groups.push(temp);
            temp = [];
          }
        });

        setPredictions(groups);
      } catch (error) {
        console.error('Failed to fetch 5+ odds predictions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Gem className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Value 5+ Odds</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[280px] w-full" />
          ))}
        </div>
      ) : predictions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {predictions.map((group, i) => (
            <PredictionCard key={i} predictionGroup={group} />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">No 5+ odds predictions found.</p>
        </div>
      )}
    </div>
  );
}
