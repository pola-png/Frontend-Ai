import type { Match } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Calendar, ShieldCheck, XCircle } from 'lucide-react';

type ResultCardProps = {
  match: Match;
};

export function ResultCard({ match }: ResultCardProps) {
  const { homeTeam, awayTeam, league, matchDateUtc, scores, prediction, outcome } = match;

  const homeTeamName = typeof homeTeam === 'object' ? homeTeam.name : homeTeam;
  const awayTeamName = typeof awayTeam === 'object' ? awayTeam.name : awayTeam;

  return (
    <Card className="flex flex-col h-full bg-card shadow-md hover:shadow-xl transition-shadow duration-300 border-border/20">
      <CardHeader>
        <CardTitle className="text-base font-medium text-muted-foreground truncate">{league}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center items-center space-y-4">
        <div className="flex w-full items-center justify-between text-center">
          <div className="flex flex-col items-center gap-2 w-2/5">
            <Avatar>
              <AvatarFallback>{homeTeamName?.charAt(0).toUpperCase() || 'H'}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-sm text-center break-words">{homeTeamName}</span>
          </div>
          <div className="w-1/5">
            {scores ? (
              <span className="text-2xl font-bold">{scores.home} - {scores.away}</span>
            ) : (
              <span className="text-xl font-bold text-muted-foreground">vs</span>
            )}
          </div>
          <div className="flex flex-col items-center gap-2 w-2/5">
            <Avatar>
              <AvatarFallback>{awayTeamName?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-sm text-center break-words">{awayTeamName}</span>
          </div>
        </div>

        {prediction?.prediction && (
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">Prediction: {prediction.prediction}</p>
            {outcome && (
              <Badge
                variant={outcome === 'won' ? 'default' : 'destructive'}
                className={cn(
                  'mt-1',
                  outcome === 'won' ? 'bg-green-500/20 text-green-700 border-green-500/30' : 'bg-red-500/20 text-red-700 border-red-500/30'
                )}
              >
                {outcome === 'won' ? (
                  <ShieldCheck className="mr-1 h-3 w-3" />
                ) : (
                  <XCircle className="mr-1 h-3 w-3" />
                )}
                {outcome.charAt(0).toUpperCase() + outcome.slice(1)}
              </Badge>
            )}
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
