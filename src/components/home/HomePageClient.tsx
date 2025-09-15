'use client';

import { useState, useEffect } from 'react';
import type { Match } from '@/lib/types';
import { getPredictionsByBucket } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PredictionCard } from '@/components/shared/PredictionCard';
import { Crown, Trophy, Gem, Rocket, ArrowRight, Calendar, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '../ui/button';

const PredictionCarousel = ({ title, predictions, icon: Icon, link, isLoading, emptyMessage }: { title: string; predictions: Match[]; icon: React.ElementType; link: string, isLoading: boolean; emptyMessage: string; }) => {
  return (
    <Card className="shadow-lg border-none bg-card">
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
        {isLoading ? (
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
        ) : predictions.length > 0 ? (
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
        ) : (
          <div className="flex justify-center items-center h-40 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground text-center px-4">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const DashboardCard = ({ title, icon: Icon, link, description }: { title: string; icon: React.ElementType; link: string; description: string; }) => {
  return (
    <Card className="shadow-lg border-none bg-card">
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
        <div className="flex justify-center items-center h-40 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground text-center px-4">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};


export function HomePageClient() {
  const [vipPredictions, setVipPredictions] = useState<Match[]>([]);
  const [twoOddsPredictions, setTwoOddsPredictions] = useState<Match[]>([]);
  const [fiveOddsPredictions, setFiveOddsPredictions] = useState<Match[]>([]);
  const [bigOddsPredictions, setBigOddsPredictions] = useState<Match[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [
          vipData, 
          twoData, 
          fiveData, 
          bigData, 
        ] = await Promise.all([
          getPredictionsByBucket("vip"),
          getPredictionsByBucket("2odds"),
          getPredictionsByBucket("5odds"),
          getPredictionsByBucket("big10"),
        ]);

        setVipPredictions(vipData || []);
        setTwoOddsPredictions(twoData || []);
        setFiveOddsPredictions(fiveData || []);
        setBigOddsPredictions(bigData || []);

      } catch (err) {
        console.error("Failed to fetch homepage data:", err);
        setError("Could not load prediction data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  return (
    <div className="space-y-12">
       {error && (
        <Card className="bg-destructive/10 border-destructive text-destructive-foreground">
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <PredictionCarousel 
          title="VIP Picks" 
          predictions={vipPredictions} 
          icon={Crown} 
          link="/predictions/vip" 
          isLoading={loading}
          emptyMessage="No VIP predictions available at the moment."
        />
        <PredictionCarousel 
          title="Daily 2+ Odds" 
          predictions={twoOddsPredictions} 
          icon={Trophy} 
          link="/predictions/2odds" 
          isLoading={loading} 
          emptyMessage="No 2+ odds predictions found for today."
        />
        <PredictionCarousel 
          title="Value 5+ Odds" 
          predictions={fiveOddsPredictions} 
          icon={Gem} 
          link="/predictions/5odds" 
          isLoading={loading} 
          emptyMessage="No 5+ odds value picks available right now."
        />
        <PredictionCarousel 
          title="Big 10+ Odds" 
          predictions={bigOddsPredictions} 
          icon={Rocket} 
          link="/predictions/big10" 
          isLoading={loading} 
          emptyMessage="No high-risk, high-reward 10+ odds picks found."
        />
        <DashboardCard 
          title="Upcoming Matches" 
          icon={Calendar} 
          link="/matches" 
          description="View all upcoming matches on the dedicated page." 
        />
        <DashboardCard 
          title="Match Results" 
          icon={CheckCircle} 
          link="/results" 
          description="Check the latest results and prediction outcomes." 
        />
      </div>
    </div>
  );
}
