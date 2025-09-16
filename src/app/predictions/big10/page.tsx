'use client';

import PredictionsPageTemplate from '../PredictionsPageTemplate';
import { Rocket } from 'lucide-react';

export default function Big10PredictionsPage() {
  return (
    <PredictionsPageTemplate
      bucket="big10"
      title="Big 10+ Odds"
      icon={<Rocket className="h-8 w-8 text-primary" />}
      emptyMessage="No high-risk, high-reward 10+ odds picks found."
    />
  );
}
