import { Match } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Flame, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { GenerateExplanationDialog } from './GenerateExplanationDialog';

const StatusIcon = ({ status }: { status: Match['prediction']['status'] }) => {
  switch (status) {
    case 'won':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'lost':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'pending':
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

export function PredictionCard({ match }: { match: Match }) {
  const { fixture, league, date, teams, prediction } = match;

  if (!prediction) {
    return null; // Or some fallback UI
  }
  
  const { odds, prediction: predText, status, is_vip } = prediction;
  const homeTeam = teams.home;
  const awayTeam = teams.away;

  return (
    <Card className="flex h-full flex-col transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold tracking-tight">{league}</CardTitle>
          {is_vip && <Badge variant="destructive" className="bg-yellow-500 text-black">VIP</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">{format(new Date(date), 'MMM d, yyyy - HH:mm')}</p>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="flex items-center justify-around text-center">
          <div className="flex flex-col items-center gap-2">
            <Avatar>
              <AvatarFallback>{homeTeam?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{homeTeam}</span>
          </div>
          <span className="text-2xl font-bold text-muted-foreground">vs</span>
          <div className="flex flex-col items-center gap-2">
            <Avatar>
              <AvatarFallback>{awayTeam?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{awayTeam}</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Prediction</p>
          <p className="font-bold text-primary">{predText}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
        <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-accent" />
            <span className="font-bold text-lg">{odds.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground">Odds</span>
        </div>
        <div className="flex items-center gap-4">
          <GenerateExplanationDialog match={match} />
          <StatusIcon status={status} />
        </div>
      </CardFooter>
    </Card>
  );
}
