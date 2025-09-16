'use client';

import PredictionsPageTemplate from '../PredictionsPageTemplate';
import { Trophy } from 'lucide-react';

export default function Daily2OddsPredictionsPage() {
  return (
    <PredictionsPageTemplate
      bucket="daily2"
      title="Daily 2+ Odds"
      icon={<Trophy className="h-8 w-8 text-primary" />}
      emptyMessage="No Daily 2+ predictions available in the next 24 hours."
    />
  );
}
