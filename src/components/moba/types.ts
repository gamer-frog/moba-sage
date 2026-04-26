// ============================================================
// MOBA SAGE — Type Definitions
// ============================================================

export interface ChampionBuild {
  name: string;
  items: string;
  winRate: number;
}

export interface Champion {
  id: number;
  name: string;
  title: string;
  role: string;
  tier: string;
  winRate: number;
  pickRate: number;
  banRate: number;
  patch: string;
  game: string;
  builds?: ChampionBuild[];
  counterPick?: string;
  synergy?: string;
  aiAnalysis?: string;
  proPickRate?: number;
  brokenThings?: string[];
  buildLinks?: { label: string; url: string }[];
  runes?: { primary: string; secondary: string; shards: string };
}

export interface PatchNote {
  id: number;
  version: string;
  title: string;
  summary: string;
  digest: string;
  date: string;
  sourceGame: string;
  highlights?: string[];
  changes?: Record<string, string[]>;
  feedStatus?: string;
}

export interface AiInsight {
  id: number;
  champion: string;
  category: string;
  content: string;
  confidence: number;
  date: string;
}

export interface TaskItem {
  id: number;
  title: string;
  description: string;
  status: string;
  pointer: number;
  interval: number;
}

export interface ProPick {
  id: number;
  champion: string;
  role: string;
  tournament: string;
  region: string;
  pickRate: number;
  banRate: number;
  winRate: number;
  patch: string;
}

export interface BrokenCombo {
  id: number;
  name: string;
  champions: string[];
  description: string;
  winRate: number;
  game: string;
  difficulty: string;
}

export interface SummonerRanked {
  queueType: string;
  tier: string;
  rank: string;
  lp: number;
  wins: number;
  losses: number;
}

export interface SummonerMostPlayed {
  champion: string;
  games: number;
  winRate: number;
}

export interface SummonerData {
  name: string;
  level: number;
  profileIconId: number;
  ranked: SummonerRanked[];
  mostPlayed: SummonerMostPlayed[];
}

export type GameSelection = null | 'lol' | 'wildrift';
