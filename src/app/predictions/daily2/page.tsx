'use client';

import PredictionsPageTemplate from '../PredictionsPageTemplate';
import { Trophy } from 'lucide-react';

export default function Daily2PredictionsPage() {
  return (
    <PredictionsPageTemplate
      bucket="daily2"
      title="Daily 2+ Odds"
      icon={<Trophy className="h-8 w-8 text-primary" />}
      emptyMessage="No 2+ odds predictions found for today."
    />
  );
}
