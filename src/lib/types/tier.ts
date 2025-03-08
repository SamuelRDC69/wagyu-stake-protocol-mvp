import { TIER_CONFIG } from '../config/tierConfig';

export interface TierEntity {
  tier: string;               
  tier_name: string;          
  weight: string;             
  staked_up_to_percent: string;
}

// src/lib/types/tier.ts
// Add safeUnstakeAmount to the interface
export interface TierProgress {
  currentTier: TierEntity;
  nextTier?: TierEntity;
  prevTier?: TierEntity;
  progress: number;
  requiredForCurrent: number;
  totalStaked: string;
  stakedAmount: string;
  currentStakedAmount: number;
  symbol: string;
  totalAmountForNext?: number;
  additionalAmountNeeded?: number;
  weight: number;
  safeUnstakeAmount: number; // New field
}

// Type for tier variants (a through v)
export type TierVariant = keyof typeof TIER_CONFIG;