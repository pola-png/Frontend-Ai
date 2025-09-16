'use client';

import { useState, useEffect } from 'react';
import { getPredictionsByBucket } from '@/lib/api';
import { PredictionCard } from '@/components/shared/PredictionCard';
import { AccumulatorCard } from '@/components/shared/AccumulatorCard';
import { Prediction } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Rocket } from 'lucide-react';

function buildAccumulators(preds: Prediction[]) {
  const uniqueByMatch = preds.reduce<Record<string, Prediction>>((acc, p) => {
    acc[p.matchId as string] = acc[p.matchId as string] || p;
    return acc;
  }, {});
  const list = Object.values(uniqueByMatch).sort((a, b) => new Date(a.matchDateUtc).getTime() - new Date(b.matchDateUtc).getTime());
  const accs: Prediction[][] = [];
  const sizes = [3, 4, 6];
  for (const size of sizes) {
    for (let i = 0; i + size <= list.length; i++) accs.push(list.slice(i, i + size));
  }
  const seen = new Set<string>();
  return accs.filter(group => {
    const key = group.map(g => g.id).join('-');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function BigOddsPredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const data = await getPredictionsByBucket('big10');
        const sorted = (data || []).sort((a, b) => new Date(a.matchDateUtc).getTime() - new Date(b.matchDateUtc).getTime());
        setPredictions(sorted);
      } catch (err) {
        console.error('Failed to fetch 10+ odds predictions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const accumulators = buildAccumulators(predictions);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Rocket className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Big 10+ Odds</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[280px] w-full" />)}
        </div>
      ) : (
        <>
          {accumulators.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {accumulators.map(group => <AccumulatorCard key={group.map(g => g.id).join('-')} predictions={group} title={`${group.length}-Match Accumulator`} />)}
            </div>
          )}

          {predictions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {predictions.map(p => <PredictionCard key={p.id} prediction={p} />)}
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">No 10+ odds predictions found.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
