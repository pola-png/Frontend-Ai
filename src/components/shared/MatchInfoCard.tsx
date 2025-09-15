import type { Match, Prediction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Calendar, ShieldCheck } from 'lucide-react';
import { Badge } from '../ui/badge';

type MatchInfoCardProps = {
  item: Match;
};

export function MatchInfoCard({ item }: MatchInfoCardProps) {
  const { teams, league, date, homeTeam, awayTeam, predictions } = item;

  if (!teams) {
    return null; 
  }

  const homeTeamName = homeTeam?.name || teams.home;
  const awayTeamName = awayTeam?.name || teams.away;

  return (
    <Card className="flex flex-col h-full bg-card/50 shadow-md hover:shadow-xl hover:bg-card/75 transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-base font-medium text-muted-foreground truncate">{league}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center items-center space-y-4">
        <div className="flex w-full items-center justify-between text-center">
          <div className="flex flex-col items-center gap-2 w-2/5">
            <Avatar>
              <AvatarFallback>{homeTeamName?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-sm text-center break-words">{homeTeamName}</span>
          </div>
          <div className="w-1/5">
             <span className="text-xl font-bold text-muted-foreground">vs</span>
          </div>
          <div className="flex flex-col items-center gap-2 w-2/5">
            <Avatar>
              <AvatarFallback>{awayTeamName?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-sm text-center break-words">{awayTeamName}</span>
          </div>
        </div>
        {predictions && predictions.length > 0 && (
          <div className="pt-4 w-full">
            <h4 className="text-sm font-semibold mb-2 text-center text-primary">AI Predictions</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {predictions.map(p => p && (
                <Badge key={p._id} variant="secondary" className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-green-500" />
                  {p.prediction}
                  <span className="font-normal opacity-75">({p.bucket})</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/50 p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(date), 'EEE, MMM d, yyyy - HH:mm')}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
