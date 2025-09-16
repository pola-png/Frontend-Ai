import { useState } from 'react';
import { Prediction } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Flame, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { GenerateExplanationDialog } from './GenerateExplanationDialog';
import Image from 'next/image';

type PredictionCardProps = {
  prediction: Prediction;
};

export function PredictionCard({ prediction }: PredictionCardProps) {
  if (!prediction) return null;

  const {
    league,
    matchDateUtc,
    homeTeam,
    awayTeam,
    odds,
    status,
    is_vip,
    prediction: predText,
    analysis,
    confidence,
  } = prediction;

  const [expanded, setExpanded] = useState(false);

  const homeTeamName = homeTeam?.name || 'Home';
  const awayTeamName = awayTeam?.name || 'Away';
  const homeTeamLogo = homeTeam?.logoUrl;
  const awayTeamLogo = awayTeam?.logoUrl;

  const displayOdds = odds && odds > 1 ? odds.toFixed(2) : null;

  const toggleExpand = () => setExpanded(!expanded);

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

  return (
    <Card className="flex h-full flex-col bg-card shadow-md transition-shadow duration-300 hover:shadow-xl border-border/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-muted-foreground truncate">
            {league || 'League'}
          </CardTitle>
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

        {/* Prediction & Odds */}
        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">Prediction</p>
          <p className="font-bold text-primary text-lg">{predText || '-'}</p>

          {displayOdds && (
            <p className="text-sm text-muted-foreground mt-1">
              Odds: <span className="font-semibold">{displayOdds}</span>
            </p>
          )}

          {confidence && (
            <p className="text-sm text-muted-foreground mt-1">
              Confidence: <span className="font-semibold">{confidence}%</span>
            </p>
          )}
        </div>

        {/* Expandable analysis */}
        {analysis && (
          <button
            onClick={toggleExpand}
            className="flex items-center justify-center gap-1 mt-2 text-sm text-primary hover:underline"
          >
            {expanded ? 'Hide Details' : 'View Details'}
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
        {expanded && analysis && (
          <div className="mt-2 text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none text-left break-words">
            {analysis.split('\n').map((p, i) => <p key={i}>{p}</p>)}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-accent" />
          {displayOdds && <span className="font-bold text-lg">{displayOdds}</span>}
          <span className="text-sm text-muted-foreground">Odds</span>
        </div>

        <div className="flex items-center gap-2">
          <GenerateExplanationDialog prediction={prediction} />
          <StatusIcon status={status} />
        </div>
      </CardFooter>
    </Card>
  );
      }
