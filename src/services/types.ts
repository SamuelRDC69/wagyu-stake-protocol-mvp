export interface ConfigData {
  maintenance: boolean;
  cooldown_seconds_per_claim: number;
  vault_account: string;
}

export interface TierData {
  tier: string;
  tier_name: string;
  weight: number;
  staked_up_to_percent: number;
}

export interface PoolData {
  staked_token_contract: string;
  staked_token_symbol: string;
  total_staked_weight: string;
  reward_pool: string;
  emission_unit: number;
  emission_rate: number;
}
