'use client';

import { Trophy } from 'lucide-react';
import PredictionsPageTemplate from './PredictionsPageTemplate';

export default function Daily2OddsPredictionsPage() {
  return <PredictionsPageTemplate bucket="daily2" icon={<Trophy className="h-8 w-8 text-primary" />} title="Daily 2+ Odds" />;
}
