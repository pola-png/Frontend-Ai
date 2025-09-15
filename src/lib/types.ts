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
  doubleChance: DoubleChance;
  over05: number;
  over15: number;
  over25: number;
  bttsYes: number;
  bttsNo: number;
  [k: string]: any;
}

export interface Prediction {
  _id: string;
  matchId: string | Match; // Can be a string or a populated Match object from the API
  fixture?: string; 
  league?: string; 
  prediction?: string;
  odds?: number;
  confidence?: number;
  bucket: '2odds' | '5odds' | 'big10' | 'vip' | string;
  status: 'pending' | 'won' | 'lost';
  is_vip?: boolean;
  outcomes?: Outcomes;
  analysis?: string;
  matchDateUtc?: string; 
  homeTeam?: Team; 
  awayTeam?: Team; 
}

export interface Match {
  _id: string;
  fixture: string;
  league: string;
  matchDateUtc: string;
  status: 'scheduled' | 'upcoming' | 'tba' | 'finished';
  homeTeam: Team | string;
  awayTeam: Team | string;
  scores?: {
    home: number;
    away: number;
  };
  predictions?: Prediction[];
  prediction?: Prediction; // For results page
  outcome?: 'won' | 'lost';
}
