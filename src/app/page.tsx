import { getDashboard } from '@/lib/api';
import { DashboardData } from '@/lib/types';
import { HomePageClient } from '@/components/home/HomePageClient';

export default async function Home() {
  const dashboardData: DashboardData = await getDashboard();

  return (
    <div className="container mx-auto px-4 py-8">
      <HomePageClient
        vipPredictions={dashboardData.vipPredictions || []}
        twoOddsPredictions={dashboardData.twoOddsPredictions || []}
        fiveOddsPredictions={dashboardData.fiveOddsPredictions || []}
        bigOddsPredictions={dashboardData.bigOddsPredictions || []}
        upcomingPredictions={dashboardData.upcomingPredictions || []}
      />
    </div>
  );
}
