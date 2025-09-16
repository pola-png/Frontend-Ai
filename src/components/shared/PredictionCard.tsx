// src/components/shared/PredictionCard.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { Prediction } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Flame, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { GenerateExplanationDialog } from './GenerateExplanationDialog';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

type Props = {
  prediction?: Prediction;
  predictionGroup?: Prediction[];
};

const StatusIcon = ({ status }: { status?: Prediction['status'] }) => {
  switch (status) {
    case 'won':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'lost':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

function niceTeamInitial(name?: string) {
  return (name?.charAt(0) || '?').toUpperCase();
}

export function PredictionCard({ prediction, predictionGroup }: Props) {
  const isGroup = Array.isArray(predictionGroup) && predictionGroup.length > 0;

  // For a single prediction, we expect prediction to be present
  if (!isGroup && !prediction) return null;

  // compute total odds for group
  const totalOdds = useMemo(() => {
    if (!isGroup || !predictionGroup) return prediction?.odds ?? 1.0;
    return Number(predictionGroup.reduce((acc, p) => acc * (p.odds || 1.0), 1).toFixed(2));
  }, [isGroup, predictionGroup, prediction]);

  const avgConfidence = useMemo(() => {
    if (!isGroup || !predictionGroup) return prediction?.confidence;
    const vals = predictionGroup.map(p => typeof p.confidence === 'number' ? p.confidence : 0);
    const sum = vals.reduce((s, v) => s + v, 0);
    return vals.length ? Math.round(sum / vals.length) : undefined;
  }, [isGroup, predictionGroup, prediction]);

  const [open, setOpen] = useState(false);

  if (isGroup && predictionGroup) {
    return (
      <Card className="flex flex-col h-full bg-card shadow-md transition-shadow duration-300 hover:shadow-xl border-border/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium text-muted-foreground truncate">
              Accumulator · {predictionGroup.length} match{predictionGroup.length > 1 ? 'es' : ''}
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Conf: {avgConfidence ?? '-'}%</span>
              <Badge variant="secondary" className="px-2">{predictionGroup[0].bucket?.toUpperCase() || 'MIX'}</Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Total Odds <span className="font-bold text-lg ml-2">{totalOdds.toFixed(2)}</span></p>
        </CardHeader>

        <CardContent className="flex-1 space-y-3">
          <div className="flex flex-col gap-2">
            {predictionGroup.slice(0, 3).map((p) => (
              <div key={p.id || `${p.matchId}-${p.bucket}`} className="flex items-center justify-between p-2 rounded-md bg-muted/10">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {p.homeTeam?.logoUrl ? (
                      <Image src={p.homeTeam.logoUrl} alt={p.homeTeam.name} width={32} height={32} />
                    ) : (
                      <AvatarFallback>{niceTeamInitial(p.homeTeam?.name)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="text-xs">
                    <div className="font-medium">{p.homeTeam?.name} <span className="opacity-60">vs</span> {p.awayTeam?.name}</div>
                    <div className="text-[11px] text-muted-foreground">{p.league || 'League'} · {p.matchDateUtc ? format(new Date(p.matchDateUtc), 'MMM d - HH:mm') : 'Date TBD'}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold">{p.prediction}</div>
                  <div className="text-xs text-muted-foreground">{p.odds ? p.odds.toFixed(2) : '-.--'}</div>
                </div>
              </div>
            ))}

            {predictionGroup.length > 3 && (
              <div className="text-sm text-muted-foreground">+ {predictionGroup.length - 3} more matches</div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 bg-muted/50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="h-5 w-5 text-accent" />
              <div>
                <div className="font-bold">{totalOdds.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Accumulator Odds</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(s => !s)}>
                {open ? 'Hide details' : 'Show details'}
                {open ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </div>

          {open && (
            <div className="w-full border-t pt-2">
              {predictionGroup.map(p => (
                <div key={p.id || `${p.matchId}-${p.bucket}`} className="py-2 border-b last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">{p.homeTeam?.name} <span className="opacity-60">vs</span> {p.awayTeam?.name}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.league || 'League'} · {p.matchDateUtc ? format(new Date(p.matchDateUtc), 'EEE, MMM d - HH:mm') : 'Date TBD'}
                      </div>
                      <div className="mt-1 text-sm">{p.prediction}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{p.odds?.toFixed(2) ?? '-.--'}</div>
                      <div className="text-xs text-muted-foreground">Conf: {p.confidence ?? '-' }%</div>
                    </div>
                  </div>

                  {/* show a small breakdown if outcomes exist */}
                  {p.outcomes && (
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      {p.outcomes.oneXTwo && (
                        <div>
                          <div className="font-semibold">1X2</div>
                          <div>H: {(p.outcomes.oneXTwo.home * 100).toFixed(0)}% · D: {(p.outcomes.oneXTwo.draw * 100).toFixed(0)}% · A: {(p.outcomes.oneXTwo.away * 100).toFixed(0)}%</div>
                        </div>
                      )}
                      {p.outcomes.doubleChance && (
                        <div>
                          <div className="font-semibold">Double Chance</div>
                          <div>H/D: {(p.outcomes.doubleChance.homeOrDraw * 100).toFixed(0)}% · H/A: {(p.outcomes.doubleChance.homeOrAway * 100).toFixed(0)}% · D/A: {(p.outcomes.doubleChance.drawOrAway * 100).toFixed(0)}%</div>
                        </div>
                      )}
                      {typeof p.outcomes.over15 === 'number' && <div>Over1.5: {(p.outcomes.over15 * 100).toFixed(0)}%</div>}
                      {typeof p.outcomes.over25 === 'number' && <div>Over2.5: {(p.outcomes.over25 * 100).toFixed(0)}%</div>}
                      {typeof p.outcomes.bttsYes === 'number' && <div>BTTS Yes: {(p.outcomes.bttsYes * 100).toFixed(0)}%</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardFooter>
      </Card>
    );
  }

  // --- Single match card ---
  const p = prediction as Prediction;
  const homeTeamName = p.homeTeam?.name || 'Home';
  const awayTeamName = p.awayTeam?.name || 'Away';
  const homeTeamLogo = p.homeTeam?.logoUrl;
  const awayTeamLogo = p.awayTeam?.logoUrl;

  return (
    <Card className="flex h-full flex-col bg-card shadow-md transition-shadow duration-300 hover:shadow-xl border-border/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-muted-foreground truncate">{p.league || 'Match'}</CardTitle>
          {p.is_vip && <Badge variant="destructive" className="bg-yellow-500 text-black">VIP</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">
          {p.matchDateUtc ? format(new Date(p.matchDateUtc), 'MMM d, yyyy - HH:mm') : 'Date TBD'}
        </p>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pt-4">
        <div className="flex items-center justify-around text-center">
          <div className="flex flex-col items-center gap-2 w-2/5">
            <Avatar>
              {homeTeamLogo ? <Image src={homeTeamLogo} alt={homeTeamName} width={40} height={40} /> : <AvatarFallback>{niceTeamInitial(homeTeamName)}</AvatarFallback>}
            </Avatar>
            <span className="font-medium text-sm break-words">{homeTeamName}</span>
          </div>

          <span className="text-2xl font-bold text-muted-foreground">vs</span>

          <div className="flex flex-col items-center gap-2 w-2/5">
            <Avatar>
              {awayTeamLogo ? <Image src={awayTeamLogo} alt={awayTeamName} width={40} height={40} /> : <AvatarFallback>{niceTeamInitial(awayTeamName)}</AvatarFallback>}
            </Avatar>
            <span className="font-medium text-sm break-words">{awayTeamName}</span>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">Prediction</p>
          <p className="font-bold text-primary text-lg">{p.prediction || '-'}</p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-accent" />
          <span className="font-bold text-lg">{p.odds ? p.odds.toFixed(2) : '-.--'}</span>
          <span className="text-sm text-muted-foreground">Odds</span>
        </div>

        <div className="flex items-center gap-2">
          <GenerateExplanationDialog prediction={p} />
          <StatusIcon status={p.status} />
        </div>
      </CardFooter>
    </Card>
  );
  }
