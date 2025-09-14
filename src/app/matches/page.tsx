import { getDashboard } from '@/lib/api';
import { MatchInfoCard } from '@/components/shared/MatchInfoCard';
import { Match } from '@/lib/types';

export default async function MatchesPage() {
  const { upcomingPredictions } = await getDashboard();
  
  // The dashboard gives us predictions, we need to adapt them to what MatchInfoCard expects for a "match"
  const matches: Match[] = (upcomingPredictions || []).map(p => ({
    id: p.id,
    fixture: p.fixture,
    league: p.league,
    date: p.date,
    teams: p.teams,
  }));

  const sortedMatches = matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Upcoming Matches</h1>
      {sortedMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMatches.map((match) => (
            <MatchInfoCard key={match.id} item={match} type="match" />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">No upcoming matches found.</p>
        </div>
      )}
    </div>
  );
}
