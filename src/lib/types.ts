// This file contains the TypeScript interfaces for the "clean" data
// structures that the frontend UI components will consume. The functions
// in `api.ts` are responsible for transforming the raw backend response
// into these shapes.

export interface Team {
  id: string;
  name: string;
  logoUrl?: string;
}

// Represents a fully normalized prediction object, ready for the UI.
// This is created by combining a raw Prediction with its corresponding Match.
export interface Prediction {
  id: string;
  matchId: string;
  prediction: string; // "Home Win", "Draw", "Away Win", etc.
  odds: number;       // The odds for that prediction
  confidence?: number;
  bucket: '2odds' | '5odds' | 'big10' | 'vip' | string;
  status: 'pending' | 'won' | 'lost';
  is_vip?: boolean;
  analysis?: string;
  outcomes?: any; // Keep original outcomes for detailed views

  // --- Flattened properties from Match for UI convenience ---
  homeTeam: Team;
  awayTeam: Team;
  league: string;
  matchDateUtc: string;
}

// Represents a fully normalized match object, ready for the UI.
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
  // A match can have multiple predictions from different buckets, now normalized
  predictions?: Prediction[];
  // For the results page, a single relevant prediction might be attached
  prediction?: Prediction;
  outcome?: 'won' | 'lost';
}
