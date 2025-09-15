export interface Team {
  _id: string;
  name: string;
  logo?: string;
}

export interface Prediction {
  _id: string;
  prediction: string;
  odds: number;
  status: 'pending' | 'won' | 'lost';
  is_vip: boolean;
  analysis?: string;
  confidence?: number;
  bucket?: string;
}

export interface Match {
  _id:string;
  fixture: string;
  league: string;
  date: string; // This will be matchDateUtc from backend
  status: 'scheduled' | 'upcoming' | 'tba' | 'finished';
  teams: {
    home: string;
    away: string;
  };
  scores?: {
    home: number;
    away: number;
  };
  homeTeam?: Team; 
  awayTeam?: Team;
  prediction?: Partial<Prediction>;
  outcome?: 'won' | 'lost';
}


export interface DashboardData {
  upcomingMatches: Match[];
  recentResults: Match[];
  bucketCounts: Record<string, number>;
  vipPredictions: Match[];
  twoOddsPredictions: Match[];
  fiveOddsPredictions: Match[];
  bigOddsPredictions: Match[];
}
