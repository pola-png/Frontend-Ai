'use client';

import { useState, useEffect } from 'react';
import type { Prediction } from '@/lib/types';
import { getPredictionsByBucket } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PredictionCard } from '@/components/shared/PredictionCard';
import { Crown, Trophy, Gem, Rocket, ArrowRight, Calendar, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '../ui/button';

const PredictionCarousel = ({ title, predictions, icon: Icon, link, isLoading, emptyMessage }: { title: string; predictions: Prediction[]; icon: React.ElementType; link: string, isLoading: boolean; emptyMessage: string; }) => {
  const hasPredictions = predictions.length > 0;

  return (
    <Card className="shadow-lg border-border/20 bg-card hover:shadow-2xl transition-shadow duration-300">
      <div className="flex flex-col h-full">
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
                        <Skeleton className="h-[280px] w-full" />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
             </Carousel>
          ) : hasPredictions ? (
            <Carousel opts={{ align: 'start', loop: predictions.length > 2 }} className="w-full">
              <CarouselContent className="-ml-4">
                {predictions.map((p) => (
                  <CarouselItem key={p.id || `${p.matchId}-${p.bucket}`} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 block h-full">
                      <PredictionCard prediction={p} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {predictions.length > 2 && (
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
      </div>
    </Card>
  );
};

const DashboardCard = ({ title, icon: Icon, link, description }: { title: string; icon: React.ElementType; link: string; description: string; }) => {
  return (
     <Link href={link} passHref className="block h-full">
      <Card className="shadow-lg border-border/20 bg-card hover:shadow-2xl transition-shadow duration-300 h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-xl font-bold text-primary">
            <div className='flex items-center gap-2'>
              <Icon className="h-6 w-6" />
              {title}
            </div>
             <Button variant="ghost" size="sm" className="text-sm font-medium">
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground text-center px-4">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};


export function HomePageClient() {
  const [vipPredictions, setVipPredictions] = useState<Prediction[]>([]);
  const [twoOddsPredictions, setTwoOddsPredictions] = useState<Prediction[]>([]);
  const [fiveOddsPredictions, setFiveOddsPredictions] = useState<Prediction[]>([]);
  const [bigOddsPredictions, setBigOddsPredictions] = useState<Prediction[]>([]);
  
  const [loadingVip, setLoadingVip] = useState(true);
  const [loadingTwoOdds, setLoadingTwoOdds] = useState(true);
  const [loadingFiveOdds, setLoadingFiveOdds] = useState(true);
  const [loadingBigOdds, setLoadingBigOdds] = useState(true);

  useEffect(() => {
    const fetchVip = async () => {
      try {
        setLoadingVip(true);
        const vipData = await getPredictionsByBucket("vip");
        setVipPredictions(vipData || []);
      } catch (err) { console.error("Failed to fetch vip predictions", err); } 
      finally { setLoadingVip(false); }
    };
    
    const fetchTwoOdds = async () => {
      try {
        setLoadingTwoOdds(true);
        const twoData = await getPredictionsByBucket("daily2");
        setTwoOddsPredictions(twoData || []);
      } catch (err) { console.error("Failed to fetch 2odds predictions", err); }
      finally { setLoadingTwoOdds(false); }
    };
    
    const fetchFiveOdds = async () => {
      try {
        setLoadingFiveOdds(true);
        const fiveData = await getPredictionsByBucket("value5");
        setFiveOddsPredictions(fiveData || []);
      } catch (err) { console.error("Failed to fetch 5odds predictions", err); }
      finally { setLoadingFiveOdds(false); }
    };
    
    const fetchBigOdds = async () => {
      try {
        setLoadingBigOdds(true);
        const bigData = await getPredictionsByBucket("big10");
        setBigOddsPredictions(bigData || []);
      } catch (err) { console.error("Failed to fetch big10 predictions", err); }
      finally { setLoadingBigOdds(false); }
    };
    
    fetchVip();
    fetchTwoOdds();
    fetchFiveOdds();
    fetchBigOdds();
  }, []);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <PredictionCarousel 
          title="VIP Picks" 
          predictions={vipPredictions} 
          icon={Crown} 
          link="/predictions/vip" 
          isLoading={loadingVip}
          emptyMessage="No VIP predictions available at the moment."
        />
        <PredictionCarousel 
          title="Daily 2+ Odds" 
          predictions={twoOddsPredictions} 
          icon={Trophy} 
          link="/predictions/daily2" 
          isLoading={loadingTwoOdds} 
          emptyMessage="No 2+ odds predictions found for today."
        />
        <PredictionCarousel 
          title="Value 5+ Odds" 
          predictions={fiveOddsPredictions} 
          icon={Gem} 
          link="/predictions/value5" 
          isLoading={loadingFiveOdds} 
          emptyMessage="No 5+ odds value picks available right now."
        />
        <PredictionCarousel 
          title="Big 10+ Odds" 
          predictions={bigOddsPredictions} 
          icon={Rocket} 
          link="/predictions/big10" 
          isLoading={loadingBigOdds} 
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
