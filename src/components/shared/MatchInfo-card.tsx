import type { Match } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';

type MatchInfoCardProps = {
  item: Match;
};

export function MatchInfoCard({ item }: MatchInfoCardProps) {
  const { teams, league, date } = item;

  if (!teams) {
    return null; 
  }

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-base font-medium text-muted-foreground truncate">{league}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center items-center space-y-4">
        <div className="flex w-full items-center justify-between text-center">
          <div className="flex flex-col items-center gap-2 w-2/5">
            <Avatar>
              <AvatarFallback>{item.homeTeam?.name?.charAt(0).toUpperCase() || teams.home?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-sm text-center break-words">{item.homeTeam?.name || teams.home}</span>
          </div>
          <div className="w-1/5">
             <span className="text-xl font-bold text-muted-foreground">vs</span>
          </div>
          <div className="flex flex-col items-center gap-2 w-2/5">
            <Avatar>
              <AvatarFallback>{item.awayTeam?.name?.charAt(0).toUpperCase() || teams.away?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-sm text-center break-words">{item.awayTeam?.name || teams.away}</span>
          </div>
        </div>
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
