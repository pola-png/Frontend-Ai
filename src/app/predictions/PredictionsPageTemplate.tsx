// src/app/predictions/PredictionsPageTemplate.tsx
'use client';

import React, { useEffect, useState } from "react";
import type { Prediction } from "@/lib/types";
import { getPredictionsByBucket } from "@/lib/api";
import { PredictionCard } from "@/components/shared/PredictionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  bucket: string;
  title: string;
  icon: React.ReactNode;
  emptyMessage?: string;
};

function withinNext24Hours(matchDateUtc?: string | null) {
  if (!matchDateUtc) return false;
  const start = new Date();
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const m = new Date(matchDateUtc);
  return m >= start && m <= end;
}

function buildAccumulatorGroups(preds: Prediction[], sizes = [3, 4, 6]) {
  // Sort by date then generate sliding windows
  const sorted = preds.slice().sort((a, b) => new Date(a.matchDateUtc).getTime() - new Date(b.matchDateUtc).getTime());
  const groups: { size: number; items: Prediction[]; combinedOdds: number }[] = [];
  for (const size of sizes) {
    for (let i = 0; i + size <= sorted.length; i++) {
      const slice = sorted.slice(i, i + size);
      // Compute combined odds as product of each odds (if odds > 1)
      const combinedOdds = slice.reduce((acc, p) => acc * (p.odds && p.odds > 1 ? p.odds : 1), 1);
      groups.push({ size, items: slice, combinedOdds: Number(combinedOdds.toFixed(2)) });
    }
  }
  // sort by combinedOdds descending
  groups.sort((a, b) => b.combinedOdds - a.combinedOdds);
  return groups;
}

export default function PredictionsPageTemplate({ bucket, title, icon, emptyMessage = "No predictions." }: Props) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getPredictionsByBucket(bucket);
        // Filter to next 24 hours
        const next24 = data.filter(p => withinNext24Hours(p.matchDateUtc));
        setPredictions(next24);
      } catch (err) {
        console.error("Failed to fetch bucket", bucket, err);
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [bucket]);

  const groups = buildAccumulatorGroups(predictions);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        {icon}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-[280px] w-full" />)}
        </div>
      ) : predictions.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <>
          {/* Accumulator groups area */}
          {groups.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Accumulator Suggestions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.slice(0, 6).map((g, idx) => (
                  <Card key={`${g.size}-${idx}`} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold">Combo x{g.size} — Odds {g.combinedOdds}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        {g.items.map(item => (
                          <div key={item.id} className="flex justify-between">
                            <div className="text-sm">
                              <div className="font-medium">{item.homeTeam.name} vs {item.awayTeam.name}</div>
                              <div className="text-xs text-muted-foreground">{item.prediction} ({item.bucket})</div>
                            </div>
                            <div className="text-sm">{item.odds ? item.odds.toFixed(2) : '-.--'}</div>
                          </div>
                        ))}
                        <div className="mt-2 flex justify-between">
                          <Button size="sm">Add to slip</Button>
                          <div className="text-sm text-muted-foreground">Top combos by combined odds</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Individual predictions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {predictions.map(pred => <PredictionCard key={pred.id} prediction={pred} />)}
          </div>
        </>
      )}
    </div>
  );
                            }
