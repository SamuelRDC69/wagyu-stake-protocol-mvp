// src/lib/types/pool.ts
export interface PoolEntity {
  pool_id: number;
  staked_token_contract: string;
  total_staked_quantity: string;  // "100.00000000 WAX"
  total_staked_weight: string;    // "500.00000000 WAX"
  reward_pool: {
    quantity: string;             // "1000.00000000 WAX"
    contract: string;
  };
  emission_unit: number;          // seconds
  emission_rate: number;          // tokens per emission_unit
  last_emission_updated_at: string;
  emission_start_at: string;      // Added: When emissions begin
  emission_end_at: string;        // Added: When emissions end
  is_active: number;              // 0 or 1
}

export interface PoolStats {
  totalStaked: string;
  totalWeight: string;
  emissionRate: string;
  currentRewards: string;
}

export interface PoolRewards {
  current: string;
  projected: string;
  timeUntilNext: number;
}