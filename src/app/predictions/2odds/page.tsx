'use client';

import { useState, useEffect } from 'react';
import { getPredictionsByBucket } from '@/lib/api';
import { PredictionCard } from '@/components/shared/PredictionCard';
import { Match } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy } from 'lucide-react';

export default function TwoOddsPredictionsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        const data = await getPredictionsByBucket('2odds');
        const sortedMatches = (data || []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setMatches(sortedMatches);
      } catch (error) {
        console.error('Failed to fetch 2+ odds predictions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, []);


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Trophy className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Daily 2+ Odds</h1>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <PredictionCard key={match._id} match={match} />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">No 2+ odds predictions found.</p>
        </div>
      )}
    </div>
  );
}
