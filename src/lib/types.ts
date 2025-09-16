export interface Team {
  id: string;
  name: string;
  logoUrl?: string;
}

// Prediction normalized for frontend
export interface Prediction {
  id: string;
  matchId: string;
  prediction: string; // "Home Win", "Draw", "Away Win"
  odds: number;
  confidence?: number;
  bucket: '2odds' | '5odds' | 'big10' | 'vip' | string;
  status: 'pending' | 'won' | 'lost';
  is_vip?: boolean;
  analysis?: string;
  outcomes?: any;

  // Flattened match info
  homeTeam: Team;
  awayTeam: Team;
  league: string;
  matchDateUtc: string;
}

// Match normalized for frontend
export interface Match {
  id: string;
  league?: string;
  matchDateUtc: string;
  status: 'scheduled' | 'upcoming' | 'tba' | 'finished';
  homeTeam: Team;
  awayTeam: Team;
  scores?: {
    home: number;
    away: number;
  };
  predictions?: Prediction[];
  prediction?: Prediction;
  outcome?: 'won' | 'lost';
}
