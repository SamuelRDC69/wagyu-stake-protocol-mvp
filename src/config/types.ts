export interface ConfigData {
  maintenance: boolean;
  cooldown_seconds_per_claim: number;
  vault_account: string;
  fee_vault_account: string;      // New field
  stake_fee_basis_points: number; // New field
}

export interface TierEntity {
  tier: string;
  tier_name: string;
  weight: number;
  staked_up_to_percent: number;
}

export interface PoolEntity {
  pool_id: number;
  staked_token_contract: string;
  staked_token_symbol: string;
  total_staked_quantity: string;
  total_staked_weight: string;
  reward_pool: {
    quantity: string;
    contract: string;
  };
  emission_unit: number;
  emission_rate: number;
  emission_start_at: string;    // New field
  emission_end_at: string;      // New field
  last_emission_updated_at: string;
  is_active: boolean;
}

// Types for creating new entities
export type NewPoolData = Omit<PoolEntity, 'pool_id' | 'is_active'>;
export type NewTierData = Omit<TierEntity, 'id'>;