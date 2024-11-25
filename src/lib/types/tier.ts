// src/lib/types/tier.ts
export interface TierEntity {
  tier: string;               
  tier_name: string;          
  weight: string;             
  staked_up_to_percent: string;
}

export interface TierProgress {
  currentTier: TierEntity;
  nextTier?: TierEntity;
  prevTier?: TierEntity;
  progress: number;
  requiredForNext?: number;
  requiredForCurrent: number;
  totalStaked: string;
  stakedAmount: string;
  currentStakedAmount: number;
  symbol: string;  // Added to support token display
}

// Using the existing tier types from Leaderboard.tsx
export type TierVariant = 'supplier' | 'merchant' | 'trader' | 'market maker' | 'exchange';