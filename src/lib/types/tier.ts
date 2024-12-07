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
  // Add new fields for clearer tier amount displays
  totalAmountForNext?: number;  // Total amount needed for next tier
  additionalAmountNeeded?: number;  // Additional amount needed with fee adjustment
}

// Using the contract tier names directly
export type TierVariant = 'supplier' | 'merchant' | 'trader' | 'marketmkr' | 'exchange';