'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { Prediction } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';

type AccumulatorCardProps = {
  predictions: Prediction[]; // chosen predictions (1 per match) that make up the accumulator
  title?: string;
};

export function AccumulatorCard({ predictions, title = '' }: AccumulatorCardProps) {
  const [open, setOpen] = useState(false);

  if (!predictions || predictions.length === 0) return null;

  const totalOdds = predictions.reduce((acc, p) => acc * (p.odds ?? 1), 1);
  const totalOddsDisplay = totalOdds ? (Math.round(totalOdds * 100) / 100).toFixed(2) : '-.--';

  return (
    <Card className="bg-card border-border/20 shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold">{title || `${predictions.length}-Match Accumulator`}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Estimated total odds: <span className="font-bold text-primary">{totalOddsDisplay}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{predictions[0]?.bucket?.toUpperCase()}</Badge>
          <Button variant="ghost" size="sm" onClick={() => setOpen(v => !v)}>
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {open && (
        <CardContent className="space-y-2 pt-0">
          {predictions.map(p => (
            <div key={p.id} className="flex items-center justify-between border-b last:border-b-0 pb-2">
              <div>
                <div className="text-sm font-medium">{p.homeTeam?.name} vs {p.awayTeam?.name}</div>
                <div className="text-xs text-muted-foreground">{p.marketLabel || p.prediction} {p.marketProb ? `(${Math.round(p.marketProb * 100)}%)` : ''}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{p.odds ? p.odds.toFixed(2) : '-.--'}</div>
                <div className="text-xs text-muted-foreground">{p.league}</div>
                <div className="text-xs text-muted-foreground">{p.matchDateUtc ? format(new Date(p.matchDateUtc), 'MMM d, yyyy - HH:mm') : 'Date TBD'}</div>
              </div>
            </div>
          ))}
        </CardContent>
      )}
      <CardFooter className="flex justify-between items-center bg-muted/50 p-3">
        <div className="text-sm text-muted-foreground">Accumulator details</div>
        <div className="text-sm font-bold">Total: {totalOddsDisplay}</div>
      </CardFooter>
    </Card>
  );
}
