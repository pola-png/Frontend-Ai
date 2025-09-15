'use client';

import { useState, useEffect } from 'react';
import { getResults } from '@/lib/api';
import { MatchInfoCard } from '@/components/shared/MatchInfoCard';
import { Result } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        const data = await getResults();
        const sortedResults = (data || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setResults(sortedResults);
      } catch (error) {
        console.error('Failed to fetch results:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Latest Results</h1>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result) => (
            <MatchInfoCard key={result._id} item={result} type="result" />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">No results found.</p>
        </div>
      )}
    </div>
  );
}
