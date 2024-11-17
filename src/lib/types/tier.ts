export interface TierEntity {
  tier: string;               // "bronze" | "silver" | "gold"
  tier_name: string;          // "Bronze Tier" | "Silver Tier" | "Gold Tier"
  weight: number;             // 2.0, 4.0
  staked_up_to_percent: number; // 1.0, 5.0, 100.0
}

export interface TierProgress {
  currentTier: TierEntity;
  nextTier?: TierEntity;
  prevTier?: TierEntity;
  progress: number;
  requiredForNext?: number;
  requiredForCurrent: number;
}

export type TierVariant = 'bronze' | 'silver' | 'gold';