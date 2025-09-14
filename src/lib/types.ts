export interface Prediction {
  id: string;
  fixture: string;
  league: string;
  prediction: string;
  odds: number;
  date: string;
  status: 'pending' | 'won' | 'lost';
  is_vip: boolean;
  teams: {
    home: string;
    away: string;
  };
  scores: {
    home: number | null;
    away: number | null;
  };
  analysis: string; 
}

export interface Match {
  id: string;
  fixture: string;
  league: string;
  date: string;
  teams: {
    home: string;
    away: string;
  };
  prediction?: Prediction; // A match can have an associated prediction
}

export interface Result {
  id: string;
  fixture: string;
  league: string;
  date: string;
  status: 'finished';
  teams: {
    home: string;
    away: string;
  };
  scores: {
    home: number;
    away: number;
  };
  prediction: string;
  outcome: 'won' | 'lost';
}

export interface DashboardData {
  upcomingMatches: Match[];
  recentResults: Result[];
  bucketCounts: Record<string, number>;
}
