export interface Team {
  _id: string;
  name: string;
  logo?: string;
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
  matchId: string;
  fixture: string; // From older data model, but useful for display
  league: string; // From older data model
  prediction: string; // The textual prediction, e.g. "Home Win"
  odds: number;
  confidence: number;
  bucket: '2odds' | '5odds' | 'big10' | 'vip' | string;
  status: 'pending' | 'won' | 'lost';
  is_vip: boolean;
  outcomes?: Outcomes;
  analysis?: string;
  matchDateUtc: string;
  homeTeam: Team;
  awayTeam: Team;
}

export interface Match {
  _id: string;
  fixture: string;
  league: string;
  matchDateUtc: string;
  status: 'scheduled' | 'upcoming' | 'tba' | 'finished';
  homeTeam: Team;
  awayTeam: Team;
  scores?: {
    home: number;
    away: number;
  };
  predictions?: Prediction[];
  // For results page, a single prediction might be attached
  prediction?: Prediction;
  outcome?: 'won' | 'lost';
}
