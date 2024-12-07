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
  symbol: string;  
  // Fields for tier amounts
  totalAmountForNext?: number;  // Total amount needed for next tier
  additionalAmountNeeded?: number;  // Additional amount needed with fee adjustment
}

export type TierVariant = 'supplier' | 'merchant' | 'trader' | 'marketmkr' | 'exchange';