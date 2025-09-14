'use client';

import { useState } from 'react';
import type { Prediction, Match } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PredictionCard } from '@/components/shared/PredictionCard';
import { Crown, Trophy, Gem, Rocket } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface HomePageClientProps {
  vipPredictions: Prediction[];
  twoOddsPredictions: Prediction[];
  fiveOddsPredictions: Prediction[];
  bigOddsPredictions: Prediction[];
  upcomingPredictions: Match[];
}

const PredictionCarousel = ({ title, predictions, icon: Icon }: { title: string; predictions: Prediction[]; icon: React.ElementType }) => {
  if (predictions.length === 0) return null;
  return (
    <Card className="shadow-lg border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-primary">
          <Icon className="h-6 w-6" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Carousel opts={{ align: 'start', loop: predictions.length > 3 }} className="w-full">
          <CarouselContent className="-ml-4">
            {predictions.map((p) => (
              <CarouselItem key={p.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <PredictionCard prediction={p} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {predictions.length > 3 && (
            <>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </>
          )}
        </Carousel>
      </CardContent>
    </Card>
  );
};


export function HomePageClient({ vipPredictions, twoOddsPredictions, fiveOddsPredictions, bigOddsPredictions, upcomingPredictions }: HomePageClientProps) {
  
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <PredictionCarousel title="VIP Picks" predictions={vipPredictions} icon={Crown} />
        <PredictionCarousel title="Daily 2+ Odds" predictions={twoOddsPredictions} icon={Trophy} />
        <PredictionCarousel title="Value 5+ Odds" predictions={fiveOddsPredictions} icon={Gem} />
        <PredictionCarousel title="Big 10+ Odds" predictions={bigOddsPredictions} icon={Rocket} />
      </div>

      {upcomingPredictions.length > 0 && (
          <Card className="shadow-lg border-none">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Upcoming Matches</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Fixture</TableHead>
                            <TableHead className="hidden md:table-cell">League</TableHead>
                            <TableHead className="text-right hidden sm:table-cell">Date</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {upcomingPredictions.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell className="font-medium">{p.fixture}</TableCell>
                                <TableCell className="hidden md:table-cell">{p.league}</TableCell>
                                <TableCell className="text-right hidden sm:table-cell">{format(new Date(p.date), 'MMM d, HH:mm')}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
          </Card>
      )}

    </div>
  );
}
