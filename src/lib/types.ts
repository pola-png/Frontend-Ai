export interface Team {
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
  _id: string;
  fixture: string;
  league: string;
  date: string;
  teams: {
    home: string;
    away: string;
  };
  homeTeam?: Team;
  awayTeam?: Team;
  prediction?: Partial<Prediction>;
}

export interface Result {
  _id: string;
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
