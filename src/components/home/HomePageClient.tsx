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

const PredictionCarousel = ({ title, predictions, icon: Icon, isLoading }: { title: string; predictions: Match[]; icon: React.ElementType; isLoading: boolean }) => {
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

  useEffect(() => {
    const fetchAllPredictions = async () => {
      try {
        setLoading(prev => ({ ...prev, vip: true }));
        getPredictionsByBucket('vip').then(data => setVipPredictions(data)).finally(() => setLoading(prev => ({...prev, vip: false})));
        
        setLoading(prev => ({ ...prev, twoOdds: true }));
        getPredictionsByBucket('2odds').then(data => setTwoOddsPredictions(data)).finally(() => setLoading(prev => ({...prev, twoOdds: false})));

        setLoading(prev => ({ ...prev, fiveOdds: true }));
        getPredictionsByBucket('5odds').then(data => setFiveOddsPredictions(data)).finally(() => setLoading(prev => ({...prev, fiveOdds: false})));
        
        setLoading(prev => ({ ...prev, bigOdds: true }));
        getPredictionsByBucket('big10').then(data => setBigOddsPredictions(data)).finally(() => setLoading(prev => ({...prev, bigOdds: false})));
      } catch (error) {
        console.error("Failed to fetch predictions:", error);
      }
    };

    const fetchDashboard = async () => {
      try {
        setLoading(prev => ({ ...prev, upcoming: true }));
        const dashboardData = await getDashboard();
        setUpcomingPredictions(dashboardData.upcomingMatches || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(prev => ({ ...prev, upcoming: false }));
      }
    };
    
    fetchAllPredictions();
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <PredictionCarousel title="VIP Picks" predictions={vipPredictions} icon={Crown} isLoading={loading.vip} />
        <PredictionCarousel title="Daily 2+ Odds" predictions={twoOddsPredictions} icon={Trophy} isLoading={loading.twoOdds} />
        <PredictionCarousel title="Value 5+ Odds" predictions={fiveOddsPredictions} icon={Gem} isLoading={loading.fiveOdds} />
        <PredictionCarousel title="Big 10+ Odds" predictions={bigOddsPredictions} icon={Rocket} isLoading={loading.bigOdds} />
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
