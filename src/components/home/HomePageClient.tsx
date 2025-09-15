'use client';

import { useState, useEffect } from 'react';
import type { Match } from '@/lib/types';
import { getDashboard, getPredictionsByBucket } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PredictionCard } from '@/components/shared/PredictionCard';
import { Crown, Trophy, Gem, Rocket } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const PredictionCarousel = ({ title, predictions, icon: Icon, isLoading, error }: { title: string; predictions: Match[]; icon: React.ElementType; isLoading: boolean; error?: boolean }) => {
  if (isLoading) {
    return (
      <Card className="shadow-lg border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-primary">
            <Icon className="h-6 w-6" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-1 space-y-2">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) return null;
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
                  <PredictionCard match={p} />
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

export function HomePageClient() {
  const [vipPredictions, setVipPredictions] = useState<Match[]>([]);
  const [twoOddsPredictions, setTwoOddsPredictions] = useState<Match[]>([]);
  const [fiveOddsPredictions, setFiveOddsPredictions] = useState<Match[]>([]);
  const [bigOddsPredictions, setBigOddsPredictions] = useState<Match[]>([]);
  const [upcomingPredictions, setUpcomingPredictions] = useState<Match[]>([]);
  
  const [loading, setLoading] = useState({
    vip: true,
    twoOdds: true,
    fiveOdds: true,
    bigOdds: true,
    upcoming: true,
  });
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const dashboardDataPromise = getDashboard();
        const vipPromise = getPredictionsByBucket('vip');
        const twoOddsPromise = getPredictionsByBucket('2odds');
        const fiveOddsPromise = getPredictionsByBucket('5odds');
        const bigOddsPromise = getPredictionsByBucket('big10');

        const [dashboardData, vip, twoOdds, fiveOdds, bigOdds] = await Promise.all([
          dashboardDataPromise.finally(() => setLoading(prev => ({...prev, upcoming: false}))),
          vipPromise.finally(() => setLoading(prev => ({...prev, vip: false}))),
          twoOddsPromise.finally(() => setLoading(prev => ({...prev, twoOdds: false}))),
          fiveOddsPromise.finally(() => setLoading(prev => ({...prev, fiveOdds: false}))),
          bigOddsPromise.finally(() => setLoading(prev => ({...prev, bigOdds: false}))),
        ]);

        setUpcomingPredictions(dashboardData.upcomingMatches || []);
        setVipPredictions(vip || []);
        setTwoOddsPredictions(twoOdds || []);
        setFiveOddsPredictions(fiveOdds || []);
        setBigOddsPredictions(bigOdds || []);

      } catch (err) {
        console.error("Failed to fetch homepage data:", err);
        setError("There was a problem loading the prediction data. Please try again later.");
        setLoading({ vip: false, twoOdds: false, fiveOdds: false, bigOdds: false, upcoming: false });
      }
    };
    
    fetchAllData();
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <PredictionCarousel title="VIP Picks" predictions={vipPredictions} icon={Crown} isLoading={loading.vip} error={!!error} />
        <PredictionCarousel title="Daily 2+ Odds" predictions={twoOddsPredictions} icon={Trophy} isLoading={loading.twoOdds} error={!!error} />
        <PredictionCarousel title="Value 5+ Odds" predictions={fiveOddsPredictions} icon={Gem} isLoading={loading.fiveOdds} error={!!error} />
        <PredictionCarousel title="Big 10+ Odds" predictions={bigOddsPredictions} icon={Rocket} isLoading={loading.bigOdds} error={!!error} />
      </div>

      <Card className="shadow-lg border-none">
        <CardHeader>
            <CardTitle className="text-xl font-bold">Upcoming Predictions</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Fixture</TableHead>
                        <TableHead className="hidden md:table-cell">League</TableHead>
                        <TableHead>Prediction</TableHead>
                        <TableHead className="text-right">Odds</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">Date</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {loading.upcoming ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                          <TableCell className="text-right hidden sm:table-cell"><Skeleton className="h-5 w-28 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : upcomingPredictions.length > 0 ? (
                      upcomingPredictions.map((p) => (
                        <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.fixture}</TableCell>
                            <TableCell className="hidden md:table-cell">{p.league}</TableCell>
                            <TableCell>{p.prediction?.prediction || '-'}</TableCell>
                            <TableCell className="text-right">
                              {p.prediction?.odds !== undefined ? p.prediction.odds.toFixed(2) : '-'}
                            </TableCell>
                            <TableCell className="text-right hidden sm:table-cell">{format(new Date(p.date), 'MMM d, HH:mm')}</TableCell>
                        </TableRow>
                    ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">No upcoming predictions found.</TableCell>
                      </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
