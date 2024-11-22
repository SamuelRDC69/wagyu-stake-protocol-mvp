export interface StakedEntity {
  pool_id: number;
  staked_quantity: string;    // "100.00000000 WAX"
  tier: string;              // "bronze" | "silver" | "gold"
  last_claimed_at: string;   // ISO date string
  cooldown_end_at: string;   // ISO date string
  owner: string;             // Account name
}

export interface StakedStatus {
  amount: string;
  tier: string;
  lastClaim: string;
  nextClaimTime: string;
  isClaimReady: boolean;
  cooldownProgress: number;
}
