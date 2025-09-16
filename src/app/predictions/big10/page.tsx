// src/app/predictions/big10/page.tsx
'use client';

import PredictionsPageTemplate from '../PredictionsPageTemplate';
import { Rocket } from 'lucide-react';

export default function BigOddsPredictionsPage() {
  return (
    <PredictionsPageTemplate
      bucket="big10"
      title="Big 10+ Odds"
      icon={<Rocket className="h-8 w-8 text-primary" />}
      emptyMessage="No 10+ odds predictions available in the next 24 hours."
    />
  );
}
