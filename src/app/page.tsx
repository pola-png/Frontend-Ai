import { getDashboard, getPredictionsByBucket } from '@/lib/api';
import type { Prediction } from '@/lib/types';
import { HomePageClient } from '@/components/home/HomePageClient';

export default async function Home() {
  const dashboardData = await getDashboard();
  
  // The API a user has provided does not return predictions grouped by odds
  // It only returns the counts for each bucket
  // We will call the predictions endpoint for each bucket to get the data
  // In a real world application, this would be a single API call
  const vipPredictions: Prediction[] = await getPredictionsByBucket('vip');
  const twoOddsPredictions: Prediction[] = await getPredictionsByBucket('2odds');
  const fiveOddsPredictions: Prediction[] = await getPredictionsByBucket('5odds');
  const bigOddsPredictions: Prediction[] = await getPredictionsByBucket('big10');

  const upcomingPredictions: Prediction[] = dashboardData.upcomingMatches || [];

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
