'use client';

import { Crown } from 'lucide-react';
import PredictionsPageTemplate from './PredictionsPageTemplate';

export default function VipPredictionsPage() {
  return <PredictionsPageTemplate bucket="vip" icon={<Crown className="h-8 w-8 text-primary" />} title="VIP Picks" />;
}
