'use client';

import { useState, useEffect } from 'react';
import { getPredictionsByBucket } from '@/lib/api';
import { PredictionCard } from '@/components/shared/PredictionCard';
import { Prediction } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Rocket } from 'lucide-react';

export default function BigOddsPredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        const data = await getPredictionsByBucket('big10');
        const sortedPredictions = (data || []).sort((a, b) => new Date(a.matchDateUtc).getTime() - new Date(b.matchDateUtc).getTime());
        setPredictions(sortedPredictions);
      } catch (error) {
        console.error('Failed to fetch 10+ odds predictions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, []);


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Rocket className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Big 10+ Odds</h1>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[280px] w-full" />
          ))}
        </div>
      ) : predictions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {predictions.map((prediction) => (
            <PredictionCard key={prediction.id} prediction={prediction} />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">No 10+ odds predictions found.</p>
        </div>
      )}
    </div>
  );
}
