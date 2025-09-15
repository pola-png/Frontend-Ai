'use client';

import { useState, useEffect } from 'react';
import type { Match } from '@/lib/types';
import { getPredictionsByBucket, getUpcomingMatches } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PredictionCard } from '@/components/shared/PredictionCard';
import { Crown, Trophy, Gem, Rocket, ArrowRight, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '../ui/button';
import { MatchInfoCard } from '../shared/MatchInfoCard';

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

  if (error || !predictions || predictions.length === 0) return null;

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

const MatchCarousel = ({ title, matches, icon: Icon, link, isLoading, error }: { title: string; matches: Match[]; icon: React.ElementType; link: string, isLoading: boolean; error?: boolean }) => {
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

  if (error || !matches || matches.length === 0) return null;

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
        <Carousel opts={{ align: 'start', loop: matches.length > 3 }} className="w-full">
          <CarouselContent className="-ml-4">
            {matches.map((match) => (
              <CarouselItem key={match._id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <MatchInfoCard item={match} type="match" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {matches.length > 3 && (
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
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(false);
        
        const [
          vipData, 
          twoData, 
          fiveData, 
          bigData, 
          upcomingData
        ] = await Promise.all([
          getPredictionsByBucket("vip"),
          getPredictionsByBucket("2odds"),
          getPredictionsByBucket("5odds"),
          getPredictionsByBucket("big10"),
          getUpcomingMatches(),
        ]);

        setVipPredictions(vipData || []);
        setTwoOddsPredictions(twoData || []);
        setFiveOddsPredictions(fiveData || []);
        setBigOddsPredictions(bigData || []);
        setUpcomingMatches((upcomingData || []).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 10));

      } catch (err) {
        console.error("Failed to fetch homepage data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <MatchCarousel title="Upcoming Matches" matches={upcomingMatches} icon={Calendar} link="/matches" isLoading={loading} error={error && upcomingMatches.length === 0} />
        <PredictionCarousel title="VIP Picks" predictions={vipPredictions} icon={Crown} link="/predictions/vip" isLoading={loading} error={error && vipPredictions.length === 0} />
        <PredictionCarousel title="Daily 2+ Odds" predictions={twoOddsPredictions} icon={Trophy} link="/predictions/2odds" isLoading={loading} error={error && twoOddsPredictions.length === 0} />
        <PredictionCarousel title="Value 5+ Odds" predictions={fiveOddsPredictions} icon={Gem} link="/predictions/5odds" isLoading={loading} error={error && fiveOddsPredictions.length === 0} />
        <PredictionCarousel title="Big 10+ Odds" predictions={bigOddsPredictions} icon={Rocket} link="/predictions/big10" isLoading={loading} error={error && bigOddsPredictions.length === 0} />
      </div>
    </div>
  );
}
