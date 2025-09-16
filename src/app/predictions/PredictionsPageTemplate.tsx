'use client';

import { useState, useEffect } from 'react';
import { getPredictionsByBucket } from '@/lib/api';
import { PredictionCard } from '@/components/shared/PredictionCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Prediction } from '@/lib/types';

interface PredictionsPageTemplateProps {
  bucket: string;
  title: string;
  icon: React.ReactNode;
  emptyMessage: string;
}

export default function PredictionsPageTemplate({
  bucket,
  title,
  icon,
  emptyMessage,
}: PredictionsPageTemplateProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        const data = await getPredictionsByBucket(bucket);

        const now = new Date();
        const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const upcomingPredictions = (data || [])
          .filter(p => {
            const matchDate = new Date(p.matchDateUtc);
            return matchDate >= now && matchDate <= next24h && p.prediction && p.odds && p.odds > 1;
          })
          .sort((a, b) => new Date(a.matchDateUtc).getTime() - new Date(b.matchDateUtc).getTime());

        setPredictions(upcomingPredictions);
      } catch (error) {
        console.error(`Failed to fetch ${bucket} predictions:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [bucket]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        {icon}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[280px] w-full" />
          ))}
        </div>
      ) : predictions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {predictions.map(prediction => (
            <PredictionCard key={prediction.id} prediction={prediction} />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
