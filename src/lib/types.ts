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
  homeTeam: Team; 
  awayTeam: Team;
}

export interface Match {
  _id: string;
  fixture: string;
  league: string;
  date: string; 
  status: 'scheduled' | 'upcoming' | 'tba' | 'finished';
  homeTeam: Team;
  awayTeam: Team;
  scores?: {
    home: number;
    away: number;
  };
  // A single prediction object for the simple results page
  prediction?: Prediction;
  // An array of all available predictions for the match summary/upcoming page
  predictions?: Prediction[];
  outcome?: 'won' | 'lost';
}
