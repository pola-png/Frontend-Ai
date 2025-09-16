// src/app/predictions/PredictionsPageTemplate.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Prediction } from '@/lib/types';
import { getPredictionsByBucket } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { PredictionCard } from '@/components/shared/PredictionCard';
import { Button } from '@/components/ui/button';

type Props = {
  bucket: string;
  title: string;
  icon: React.ReactNode;
  emptyMessage: string;
};

export default function PredictionsPageTemplate({ bucket, title, icon, emptyMessage }: Props) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupSize, setGroupSize] = useState<number>(3); // default chunk size (can change based on bucket)

  useEffect(() => {
    if (bucket === 'daily2') setGroupSize(3);
    else if (bucket === 'value5') setGroupSize(4);
    else if (bucket === 'big10') setGroupSize(6);
    else setGroupSize(3);
  }, [bucket]);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const data = await getPredictionsByBucket(bucket);
        // data is a flat array of normalized Prediction objects
        setPredictions(data || []);
      } catch (err) {
        console.error('Failed to fetch predictions:', err);
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [bucket]);

  // Group into accumulators by date, then chunk by groupSize
  const groups = useMemo(() => {
    if (!predictions || predictions.length === 0) return [] as Prediction[][];
    // group by day
    const byDay = predictions.reduce<Record<string, Prediction[]>>((acc, p) => {
      const day = p.matchDateUtc ? new Date(p.matchDateUtc).toISOString().slice(0, 10) : 'unknown';
      if (!acc[day]) acc[day] = [];
      acc[day].push(p);
      return acc;
    }, {});

    const allGroups: Prediction[][] = [];
    Object.keys(byDay).sort().forEach(day => {
      // sort matches within day
      const arr = byDay[day].sort((a, b) => new Date(a.matchDateUtc).getTime() - new Date(b.matchDateUtc).getTime());
      for (let i = 0; i < arr.length; i += groupSize) {
        allGroups.push(arr.slice(i, i + groupSize));
      }
    });

    return allGroups;
  }, [predictions, groupSize]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        {icon}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => { setGroupSize(3); }}>3-up</Button>
          <Button size="sm" variant="outline" onClick={() => { setGroupSize(4); }}>4-up</Button>
          <Button size="sm" variant="outline" onClick={() => { setGroupSize(6); }}>6-up</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[280px] w-full" />)}
        </div>
      ) : groups.length > 0 ? (
        <div className="space-y-8">
          {groups.map((acc, idx) => {
            const totalOdds = acc.reduce((accum, p) => accum * (p.odds ?? 1), 1);
            const avgConfidence = Math.round((acc.reduce((s, p) => s + (p.confidence ?? 0), 0) / Math.max(1, acc.length)) * 100) / 100;

            return (
              <div key={`acc-${idx}`} className="p-4 rounded-lg border bg-card shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Accumulator #{idx + 1}</h3>
                    <p className="text-sm text-muted-foreground">Matches: {acc.length} • Avg confidence: {avgConfidence ? `${avgConfidence}` : 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Odds</div>
                    <div className="text-2xl font-bold text-primary">{Number.isFinite(totalOdds) ? totalOdds.toFixed(2) : '-.--'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {acc.map(p => <PredictionCard key={p.id ?? `${p.matchId}-${p.bucket}`} prediction={p} />)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
