import { getDashboard, getPredictionsByBucket } from '@/lib/api';
import type { Match } from '@/lib/types';
import { HomePageClient } from '@/components/home/HomePageClient';

export default async function Home() {
  const dashboardData = await getDashboard();
  
  const vipPredictions = await getPredictionsByBucket('vip');
  const twoOddsPredictions = await getPredictionsByBucket('2odds');
  const fiveOddsPredictions = await getPredictionsByBucket('5odds');
  const bigOddsPredictions = await getPredictionsByBucket('big10');

  const upcomingPredictions: Match[] = dashboardData.upcomingMatches || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <HomePageClient
        vipPredictions={vipPredictions || []}
        twoOddsPredictions={twoOddsPredictions || []}
        fiveOddsPredictions={fiveOddsPredictions || []}
        bigOddsPredictions={bigOddsPredictions || []}
        upcomingPredictions={upcomingPredictions || []}
      />
    </div>
  );
}
