import { Asset, Name, TimePoint } from '@wharfkit/session'

// Matches config table structure
export interface ConfigRow {
    maintenance: boolean
    cooldown_seconds_per_claim: number
    vault_account: Name
}

// Matches pool_entity structure
export interface PoolEntity {
    pool_id: number
    staked_token_contract: Name
    total_staked_quantity: Asset
    total_staked_weight: Asset
    reward_pool: {
        contract: Name
        quantity: Asset
    }
    emission_unit: number
    emission_rate: number
    last_emission_updated_at: TimePoint
    is_active: boolean
}

// Matches tier_entity structure
export interface TierEntity {
    tier: Name
    tier_name: string
    weight: number
    staked_up_to_percent: number
}

// Matches staked_entity structure
export interface StakedEntity {
    pool_id: number
    staked_quantity: Asset
    tier: Name
    last_claimed_at: TimePoint
    cooldown_end_at: TimePoint
}

// Contract action parameters
export interface StakeActionParams {
    from: Name
    to: Name
    quantity: Asset
    memo: string
}

export interface UnstakeActionParams {
    claimer: Name
    pool_id: number
    quantity: Asset
}

export interface ClaimActionParams {
    claimer: Name
    pool_id: number
}

export interface SetConfigActionParams {
    cooldown_seconds_per_claim: number
    vault_account: Name
}

export interface SetTierActionParams {
    tier: Name
    tier_name: string
    weight: number
    staked_up_to_percent: number
}

export interface SetPoolActionParams {
    staked_token_contract: Name
    staked_token_symbol: string
    total_staked_weight: Asset
    reward_pool: {
        contract: Name
        quantity: Asset
    }
    emission_unit: number
    emission_rate: number
}