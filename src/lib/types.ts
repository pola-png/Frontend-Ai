export interface Team {
  _id: string;
  name: string;
  logoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OneXTwo {
  home: number;
  draw: number;
  away: number;
}

export interface DoubleChance {
  homeOrDraw: number;
  homeOrAway: number;
  drawOrAway: number;
}

export interface Outcomes {
  oneXTwo: OneXTwo;
  doubleChance?: DoubleChance;
  over05?: number;
  over15?: number;
  over25?: number;
  bttsYes?: number;
  bttsNo?: number;
  [k: string]: any;
}

// This interface represents a "normalized" prediction object,
// where match details are flattened for easier UI consumption.
// This is primarily for the /predictions/:bucket endpoints.
export interface Prediction {
  _id: string;
  matchId: string; 
  prediction?: string; 
  outcomes?: Outcomes;
  odds?: number;
  confidence?: number;
  bucket: '2odds' | '5odds' | 'big10' | 'vip' | string;
  status: 'pending' | 'won' | 'lost';
  is_vip?: boolean;
  analysis?: string;
  
  // --- Flattened properties from Match for UI convenience ---
  homeTeam: Team;
  awayTeam: Team;
  league: string;
  matchDateUtc: string;
}

// This interface represents a match, which can contain its own predictions.
// This is primarily for the /matches/upcoming and /results endpoints.
export interface Match {
  _id: string;
  fixture?: string;
  league?: string;
  matchDateUtc: string;
  status: 'scheduled' | 'upcoming' | 'tba' | 'finished';
  homeTeam: Team | string;
  awayTeam: Team | string;
  scores?: {
    home: number;
    away: number;
  };
  // A match can have multiple predictions from different buckets
  predictions?: Prediction[];
  // For the results page, a single relevant prediction might be attached
  prediction?: Prediction; 
  outcome?: 'won' | 'lost';
}
