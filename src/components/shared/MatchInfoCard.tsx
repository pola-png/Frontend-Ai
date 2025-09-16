// src/components/shared/MatchInfoCard.tsx
'use client';

import type { Match } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '../ui/badge';

type MatchInfoCardProps = {
  match: Match;
};

export function MatchInfoCard({ match }: MatchInfoCardProps) {
  if (!match) return null;

  const { homeTeam, awayTeam, league, matchDateUtc, predictions } = match;

  const homeTeamName = homeTeam?.name || 'Home';
  const awayTeamName = awayTeam?.name || 'Away';
  const homeTeamLogo = homeTeam?.logoUrl;
  const awayTeamLogo = awayTeam?.logoUrl;

  // Pick the top prediction for display (highest confidence or first)
  const topPred = (predictions || []).length > 0 ? predictions[0] : undefined;
  const displayOdds = topPred?.odds && topPred.odds > 1 ? topPred.odds.toFixed(2) : null;

  return (
    <Card className="flex flex-col h-full bg-card shadow-md hover:shadow-xl transition-shadow duration-300 border-border/20">
      <CardHeader>
        <CardTitle className="text-base font-medium text-muted-foreground truncate">{league || 'League'}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center items-center space-y-4">
        <div className="flex w-full items-center justify-between text-center">
          <div className="flex flex-col items-center gap-2 w-2/5">
            <Avatar>
              {homeTeamLogo ? <Image src={homeTeamLogo} alt={homeTeamName} width={40} height={40} /> : <AvatarFallback>{homeTeamName?.charAt(0).toUpperCase() || 'H'}</AvatarFallback>}
            </Avatar>
            <span className="font-semibold text-sm text-center break-words">{homeTeamName}</span>
          </div>
          <div className="w-1/5">
             <span className="text-xl font-bold text-muted-foreground">vs</span>
          </div>
          <div className="flex flex-col items-center gap-2 w-2/5">
            <Avatar>
              {awayTeamLogo ? <Image src={awayTeamLogo} alt={awayTeamName} width={40} height={40} /> : <AvatarFallback>{awayTeamName?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>}
            </Avatar>
            <span className="font-semibold text-sm text-center break-words">{awayTeamName}</span>
          </div>
        </div>

        {topPred && (
          <div className="pt-4 w-full">
            <h4 className="text-sm font-semibold mb-2 text-center text-primary">AI Predictions</h4>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                {topPred.prediction}
                {topPred.bucket && <span className="font-normal opacity-75">({topPred.bucket})</span>}
              </Badge>
              {displayOdds && <span className="text-sm text-muted-foreground">Odds: {displayOdds}</span>}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/50 p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{matchDateUtc ? format(new Date(matchDateUtc), 'EEE, MMM d, yyyy - HH:mm') : 'Date TBD'}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
