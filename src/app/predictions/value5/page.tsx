'use client';

import PredictionsPageTemplate from '../PredictionsPageTemplate';
import { Gem } from 'lucide-react';

export default function Value5OddsPredictionsPage() {
  return (
    <PredictionsPageTemplate
      bucket="value5"
      title="Value 5+ Odds"
      icon={<Gem className="h-8 w-8 text-primary" />}
      emptyMessage="No 5+ odds predictions available in the next 24 hours."
    />
  );
}
