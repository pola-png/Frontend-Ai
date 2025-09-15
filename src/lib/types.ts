export interface Team {
  _id: string;
  name: string;
  logo?: string;
}

export interface Prediction {
  _id: string;
  fixture: string;
  league: string;
  date: string;
  teams: {
    home: string;
    away: string;
  };
  prediction: string;
  odds: number;
  status: 'pending' | 'won' | 'lost';
  is_vip: boolean;
  analysis?: string;
  confidence?: number;
  bucket?: string;
  scores?: {
    home: number;
    away: number;
  };
  outcome?: 'won' | 'lost';
  homeTeam?: Team; // This is populated by backend
  awayTeam?: Team; // This is populated by backend
}

export interface Match {
  _id: string;
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
  prediction?: Partial<Prediction>; // A single prediction for results page
  predictions?: Partial<Prediction>[]; // Multiple predictions for upcoming matches
  outcome?: 'won' | 'lost';
}
