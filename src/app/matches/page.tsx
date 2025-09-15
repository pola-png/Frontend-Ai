'use client';

import { useState, useEffect } from 'react';
import { getUpcomingMatches } from '@/lib/api';
import { MatchInfoCard } from '@/components/shared/MatchInfoCard';
import { Match } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        const upcomingMatches = await getUpcomingMatches();
        const sortedMatches = (upcomingMatches || []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setMatches(sortedMatches);
      } catch (error) {
        console.error('Failed to fetch upcoming matches:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, []);


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Upcoming Matches</h1>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <MatchInfoCard key={match._id} item={match} type="match" />
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
