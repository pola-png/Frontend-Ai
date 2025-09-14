import { getResults } from '@/lib/api';
import { MatchInfoCard } from '@/components/shared/MatchInfoCard';

export default async function ResultsPage() {
  const results = await getResults();
  const sortedResults = results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Latest Results</h1>
      {sortedResults.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedResults.map((result) => (
            <MatchInfoCard key={result.id} item={result} type="result" />
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
