'use client';

import { Gem } from 'lucide-react';
import PredictionsPageTemplate from './PredictionsPageTemplate';

export default function Value5OddsPredictionsPage() {
  return <PredictionsPageTemplate bucket="value5" icon={<Gem className="h-8 w-8 text-primary" />} title="Value 5+ Odds" />;
}
