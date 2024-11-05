import { Asset, Name, TimePoint } from "@wharfkit/session"

export interface StakedEntity {
  pool_id: number
  staked_quantity: Asset
  tier: Name
  last_claimed_at: TimePoint
  cooldown_end_at: TimePoint
}

export interface PoolEntity {
  pool_id: number
  staked_token_contract: Name
  total_staked_quantity: Asset
  total_staked_weight: Asset
  reward_pool: {
    quantity: Asset
    contract: Name
  }
  emission_unit: number
  emission_rate: number
  last_emission_updated_at: TimePoint
  is_active: boolean
}

export interface TierEntity {
  tier: Name
  tier_name: string
  weight: number
  staked_up_to_percent: number
}

export interface PoolHealth {
  currentHealth: number
  projectedHealth: number
  riskLevel: "low" | "medium" | "high"
  lastUpdate: TimePoint
}

export interface PoolAnalytics {
  totalStaked: Asset
  activeStakers: number
  recentClaims: {
    account: Name
    amount: Asset
    timestamp: TimePoint
  }[]
  projectedImpact: number
}