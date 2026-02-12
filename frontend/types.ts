export interface Player {
  id: string;
  username: string;
  rank: number;
  score: number;
  avatar: string;
  trend: 'up' | 'down' | 'stable';
  change: number; // Amount changed
}

export type TrendType = Player['trend'];