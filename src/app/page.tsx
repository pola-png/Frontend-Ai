import { getPredictions } from '@/lib/api';
import { Prediction } from '@/lib/types';
import { HomePageClient } from '@/components/home/HomePageClient';

export default async function Home() {
  const predictions = await getPredictions();

  const vipPredictions = predictions.filter(p => p.is_vip).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const twoOddsPredictions = predictions.filter(p => !p.is_vip && p.odds >= 2 && p.odds < 5).sort((a, b) => b.odds - a.odds);
  const fiveOddsPredictions = predictions.filter(p => !p.is_vip && p.odds >= 5 && p.odds < 10).sort((a, b) => b.odds - a.odds);
  const bigOddsPredictions = predictions.filter(p => !p.is_vip && p.odds >= 10).sort((a, b) => b.odds - a.odds);

  const upcomingPredictions = predictions.filter(p => new Date(p.date) > new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="container mx-auto px-4 py-8">
      <HomePageClient
        vipPredictions={vipPredictions}
        twoOddsPredictions={twoOddsPredictions}
        fiveOddsPredictions={fiveOddsPredictions}
        bigOddsPredictions={bigOddsPredictions}
        upcomingPredictions={upcomingPredictions}
      />
    </div>
  );
}
