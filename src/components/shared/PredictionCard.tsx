// src/components/shared/PredictionCard.tsx
import { useState } from 'react';
import { Prediction } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Flame, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { GenerateExplanationDialog } from './GenerateExplanationDialog';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

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

export function PredictionCard({ prediction }: { prediction: Prediction }) {
  if (!prediction) return null;

  const [openDetails, setOpenDetails] = useState(false);
  const {
    league, matchDateUtc, prediction: predText, odds, status, is_vip, homeTeam, awayTeam, outcomes, confidence, bucket
  } = prediction;

  const homeTeamName = homeTeam?.name || 'Home';
  const awayTeamName = awayTeam?.name || 'Away';
  const homeTeamLogo = homeTeam?.logoUrl;
  const awayTeamLogo = awayTeam?.logoUrl;

  // helpers to render outcomes with implied odds
  const renderOneXTwo = (o: any) => {
    const h = o?.home ?? null;
    const d = o?.draw ?? null;
    const a = o?.away ?? null;
    return (
      <div className="space-y-1 text-sm">
        {h !== null && <div>Home: {(h*100).toFixed(1)}% — {h > 0 ? (1/h).toFixed(2) : '-.--'}</div>}
        {d !== null && <div>Draw: {(d*100).toFixed(1)}% — {d > 0 ? (1/d).toFixed(2) : '-.--'}</div>}
        {a !== null && <div>Away: {(a*100).toFixed(1)}% — {a > 0 ? (1/a).toFixed(2) : '-.--'}</div>}
      </div>
    );
  };

  return (
    <Card className="flex h-full flex-col bg-card shadow-md transition-shadow duration-300 hover:shadow-xl border-border/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-muted-foreground truncate">{league || 'Match'}</CardTitle>
          {is_vip && <Badge variant="destructive" className="bg-yellow-500 text-black">VIP</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">
          {matchDateUtc ? format(new Date(matchDateUtc), 'MMM d, yyyy - HH:mm') : 'Date TBD'}
        </p>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pt-4">
        <div className="flex items-center justify-around text-center">
          <div className="flex flex-col items-center gap-2 w-2/5">
            <Avatar>
              {homeTeamLogo ? <Image src={homeTeamLogo} alt={homeTeamName} width={40} height={40} /> : <AvatarFallback>{homeTeamName.charAt(0).toUpperCase()}</AvatarFallback>}
            </Avatar>
            <span className="font-medium text-sm break-words">{homeTeamName}</span>
          </div>

          <span className="text-2xl font-bold text-muted-foreground">vs</span>

          <div className="flex flex-col items-center gap-2 w-2/5">
            <Avatar>
              {awayTeamLogo ? <Image src={awayTeamLogo} alt={awayTeamName} width={40} height={40} /> : <AvatarFallback>{awayTeamName.charAt(0).toUpperCase()}</AvatarFallback>}
            </Avatar>
            <span className="font-medium text-sm break-words">{awayTeamName}</span>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">Prediction</p>
          <p className="font-bold text-primary text-lg">{predText || '-'}</p>
          <div className="text-xs text-muted-foreground mt-1">{bucket ? `(${bucket})` : ''} {confidence ? ` • ${confidence}%` : ''}</div>
        </div>

        {openDetails && (
          <div className="mt-2 p-3 bg-muted/30 rounded">
            <div className="text-sm font-semibold mb-2">Market breakdown</div>
            {outcomes?.oneXTwo && (
              <div className="mb-2">
                <div className="text-xs text-muted-foreground mb-1">1X2</div>
                {renderOneXTwo(outcomes.oneXTwo)}
              </div>
            )}

            {outcomes?.doubleChance && (
              <div className="mb-2 text-sm">
                <div className="text-xs text-muted-foreground mb-1">Double Chance</div>
                {Object.entries(outcomes.doubleChance).map(([k, v]) => (
                  <div key={k} className="text-sm">
                    {k}: {(v * 100).toFixed(1)}% — {v > 0 ? (1 / v).toFixed(2) : '-.--'}
                  </div>
                ))}
              </div>
            )}

            {typeof outcomes?.over25 === 'number' && (
              <div className="mb-1 text-sm">Over 2.5: {(outcomes.over25 * 100).toFixed(1)}% — {outcomes.over25 > 0 ? (1 / outcomes.over25).toFixed(2) : '-.--'}</div>
            )}
            {typeof outcomes?.over15 === 'number' && (
              <div className="mb-1 text-sm">Over 1.5: {(outcomes.over15 * 100).toFixed(1)}% — {outcomes.over15 > 0 ? (1 / outcomes.over15).toFixed(2) : '-.--'}</div>
            )}
            {typeof outcomes?.over05 === 'number' && (
              <div className="mb-1 text-sm">Over 0.5: {(outcomes.over05 * 100).toFixed(1)}% — {outcomes.over05 > 0 ? (1 / outcomes.over05).toFixed(2) : '-.--'}</div>
            )}

            {typeof outcomes?.bttsYes === 'number' && (
              <div className="mb-1 text-sm">BTTS Yes: {(outcomes.bttsYes * 100).toFixed(1)}% — {outcomes.bttsYes > 0 ? (1 / outcomes.bttsYes).toFixed(2) : '-.--'}</div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-accent" />
          <span className="font-bold text-lg">{odds ? Number(odds).toFixed(2) : '-.--'}</span>
          <span className="text-sm text-muted-foreground">Odds</span>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setOpenDetails(v => !v)}>{openDetails ? 'Hide' : 'Details'}</Button>
          <GenerateExplanationDialog prediction={prediction} />
          <StatusIcon status={status} />
        </div>
      </CardFooter>
    </Card>
  );
}
