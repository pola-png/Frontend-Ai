'use client';

import { useState, useEffect } from 'react';
import type { Match, DashboardData } from '@/lib/types';
import { getDashboard } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PredictionCard } from '@/components/shared/PredictionCard';
import { Crown, Trophy, Gem, Rocket, ArrowRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

const PredictionCarousel = ({ title, predictions, icon: Icon, link, isLoading, error }: { title: string; predictions: Match[]; icon: React.ElementType; link: string, isLoading: boolean; error?: boolean }) => {
  if (isLoading) {
    return (
      <Card className="shadow-lg border-none">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-xl font-bold text-primary">
            <div className="flex items-center gap-2">
              <Icon className="h-6 w-6" />
              {title}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="w-full">
             <Carousel opts={{ align: 'start', loop: false }} className="w-full">
                <CarouselContent className="-ml-4">
                  {[...Array(3)].map((_, i) => (
                    <CarouselItem key={i} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                      <div className="p-1 space-y-2">
                        <Skeleton className="h-56 w-full" />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
             </Carousel>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) return null;
  if (!predictions || predictions.length === 0) return null;

  return (
    <Card className="shadow-lg border-none">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-xl font-bold text-primary">
          <div className='flex items-center gap-2'>
            <Icon className="h-6 w-6" />
            {title}
          </div>
          <Link href={link} passHref>
             <Button variant="ghost" size="sm" className="text-sm font-medium">
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Carousel opts={{ align: 'start', loop: predictions.length > 3 }} className="w-full">
          <CarouselContent className="-ml-4">
            {predictions.map((p) => (
              <CarouselItem key={p._id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
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
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await getDashboard();
        setData(dashboardData);
      } catch (err) {
        console.error("Failed to fetch homepage data:", err);
        setError("There was a problem loading the prediction data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  if (error && !loading) {
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
  
  const upcomingPredictions = (data?.upcomingMatches || []).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <PredictionCarousel title="VIP Picks" predictions={data?.vipPredictions || []} icon={Crown} link="/predictions/vip" isLoading={loading} />
        <PredictionCarousel title="Daily 2+ Odds" predictions={data?.twoOddsPredictions || []} icon={Trophy} link="/predictions/2odds" isLoading={loading} />
        <PredictionCarousel title="Value 5+ Odds" predictions={data?.fiveOddsPredictions || []} icon={Gem} link="/predictions/5odds" isLoading={loading} />
        <PredictionCarousel title="Big 10+ Odds" predictions={data?.bigOddsPredictions || []} icon={Rocket} link="/predictions/big10" isLoading={loading} />
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
                    {loading ? (
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
                        <TableRow key={p._id}>
                            <TableCell className="font-medium">{p.fixture}</TableCell>
                            <TableCell className="hidden md:table-cell">{p.league}</TableCell>
                            <TableCell>{p.prediction?.prediction || '-'}</TableCell>
                            <TableCell className="text-right">
                              {p.prediction?.odds !== undefined ? p.prediction.odds.toFixed(2) : '-'}
                            </TableCell>
                            <TableCell className="text-right hidden sm:table-cell">{p.date ? format(new Date(p.date), 'MMM d, HH:mm') : '-'}</TableCell>
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
