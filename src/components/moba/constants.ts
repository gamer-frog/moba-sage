// ============================================================
// MOBA SAGE — Constants
// ============================================================

import {
  Search, Filter, Sword, ScrollText, AlertTriangle, ListTodo,
  Brain, ChevronRight, Zap, Shield, Target, Crosshair,
  Trophy, User, Flame, Map, Crown, Sparkles,
} from 'lucide-react';

export const TIERS = ['S', 'A', 'B'] as const;

export const TIER_CONFIG: Record<string, { color: string; label: string }> = {
  S: { color: '#c8aa6e', label: 'Dioses del Meta' },
  A: { color: '#0acbe6', label: 'Fuertes' },
  B: { color: '#0fba81', label: 'Jugables' },
};

export const ROLE_CONFIG: Record<string, { color: string; label: string; icon: typeof Sword }> = {
  Top: { color: '#c8aa6e', label: 'TOP', icon: Shield },
  Jungle: { color: '#0acbe6', label: 'JNG', icon: Crosshair },
  Mid: { color: '#e84057', label: 'MID', icon: Zap },
  ADC: { color: '#f0c646', label: 'ADC', icon: Target },
  Support: { color: '#5b8af5', label: 'SUP', icon: User },
};

export const CATEGORY_CONFIG: Record<string, { color: string; label: string; icon: typeof ChevronRight }> = {
  'tier-change': { color: '#c8aa6e', label: 'Cambio de Tier', icon: Trophy },
  buff: { color: '#0acbe6', label: 'Buff', icon: ChevronRight },
  nerf: { color: '#e84057', label: 'Nerf', icon: AlertTriangle },
  meta: { color: '#f0c646', label: 'Meta', icon: Sparkles },
  counter: { color: '#5b8af5', label: 'Counter', icon: Crosshair },
  synergy: { color: '#0acbe6', label: 'Sinergia', icon: User },
};

export const ROLES = ['Todos', 'Top', 'Jungle', 'Mid', 'ADC', 'Support'];

export const REGIONS = [
  { value: 'LAN', label: 'LAN' },
  { value: 'LAS', label: 'LAS' },
  { value: 'NA', label: 'NA' },
  { value: 'EUW', label: 'EUW' },
  { value: 'EUNE', label: 'EUNE' },
  { value: 'KR', label: 'KR' },
  { value: 'JP', label: 'JP' },
  { value: 'BR', label: 'BR' },
  { value: 'OCE', label: 'OCE' },
  { value: 'TR', label: 'TR' },
  { value: 'RU', label: 'RU' },
  { value: 'SG', label: 'SG' },
  { value: 'PH', label: 'PH' },
  { value: 'TH', label: 'TH' },
  { value: 'TW', label: 'TW' },
  { value: 'VN', label: 'VN' },
];

export const TOURNAMENT_REGIONS = [
  { value: '', label: 'Todos' },
  { value: 'KR', label: 'LCK' },
  { value: 'CN', label: 'LPL' },
  { value: 'EU', label: 'LEC' },
  { value: 'NA', label: 'LCS' },
];

export const TAB_ITEMS = [
  { id: 'tierlist', label: 'Tier List', icon: Trophy },
  { id: 'patches', label: 'Parches', icon: ScrollText },
  { id: 'broken', label: 'Cosas Rotas', icon: AlertTriangle },
  { id: 'tasks', label: 'Tareas', icon: ListTodo },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
  { id: 'combos', label: 'Combos', icon: Flame },
  { id: 'competitive', label: 'Competitivo', icon: Crown },
  { id: 'profile', label: 'Perfil', icon: User },
];

export const TIER_COLORS: Record<string, string> = {
  Iron: '#5b5a56',
  Bronze: '#8c5e3c',
  Silver: '#a0a0a0',
  Gold: '#c8aa6e',
  Platinum: '#0acbe6',
  Emerald: '#0fba81',
  Diamond: '#e84057',
  Master: '#9d48e0',
  Grandmaster: '#e040f5',
  Challenger: '#f0c646',
};
