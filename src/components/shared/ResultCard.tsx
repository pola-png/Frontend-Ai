import { Match } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import Image from 'next/image';

type ResultCardProps = {
  match: Match;
};

export function ResultCard({ match }: ResultCardProps) {
  if (!match) return null;

  const {
    league,
    matchDateUtc,
    homeTeam,
    awayTeam,
    scores,
    prediction,
    outcome,
  } = match;

  const homeTeamName = homeTeam?.name || 'Home';
  const awayTeamName = awayTeam?.name || 'Away';
  const homeTeamLogo = homeTeam?.logoUrl;
  const awayTeamLogo = awayTeam?.logoUrl;

  const displayOdds = prediction?.odds && prediction.odds > 1 ? prediction.odds.toFixed(2) : null;

  return (
    <Card className="flex flex-col bg-card shadow-md hover:shadow-lg border-border/20">
      <CardHeader>
        <CardTitle className="text-base font-medium truncate">{league || 'League'}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {matchDateUtc ? format(new Date(matchDateUtc), 'MMM d, yyyy - HH:mm') : 'Date TBD'}
        </p>
      </CardHeader>

      <CardContent className="flex justify-around items-center py-4">
        <div className="flex flex-col items-center gap-2 w-2/5">
          <Avatar>
            {homeTeamLogo ? <Image src={homeTeamLogo} alt={homeTeamName} width={40} height={40} /> : <AvatarFallback>{homeTeamName.charAt(0)}</AvatarFallback>}
          </Avatar>
          <span className="text-sm font-medium text-center">{homeTeamName}</span>
          {scores && <span className="text-lg font-bold">{scores.home}</span>}
        </div>

        <span className="text-lg font-bold text-muted-foreground">-</span>

        <div className="flex flex-col items-center gap-2 w-2/5">
          <Avatar>
            {awayTeamLogo ? <Image src={awayTeamLogo} alt={awayTeamName} width={40} height={40} /> : <AvatarFallback>{awayTeamName.charAt(0)}</AvatarFallback>}
          </Avatar>
          <span className="text-sm font-medium text-center">{awayTeamName}</span>
          {scores && <span className="text-lg font-bold">{scores.away}</span>}
        </div>
      </CardContent>

      {prediction && (
        <CardFooter className="flex justify-between items-center bg-muted/50 px-4 py-2">
          <div>
            <p className="text-sm text-muted-foreground">Prediction</p>
            <p className="font-bold text-primary">{prediction.prediction}</p>
            {displayOdds && <p className="text-sm">Odds: <span className="font-semibold">{displayOdds}</span></p>}
          </div>
          <Badge variant={outcome === 'won' ? 'success' : outcome === 'lost' ? 'destructive' : 'outline'}>
            {outcome || 'Pending'}
          </Badge>
        </CardFooter>
      )}
    </Card>
  );
}
