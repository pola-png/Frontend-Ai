// src/app/predictions/vip/page.tsx
'use client';

import PredictionsPageTemplate from '../PredictionsPageTemplate';
import { Crown } from 'lucide-react';

export default function VipPredictionsPage() {
  return (
    <PredictionsPageTemplate
      bucket="vip"
      title="VIP Picks"
      icon={<Crown className="h-8 w-8 text-primary" />}
      emptyMessage="No VIP predictions available in the next 24 hours."
    />
  );
}
