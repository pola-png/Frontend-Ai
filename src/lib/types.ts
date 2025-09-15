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
  analysis?: string; // Analysis is optional
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
  prediction?: Partial<Prediction>; // Prediction is optional and can be partial
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
