import { Asset, Name, TimePoint } from '@wharfkit/session'

// Entity Types
export interface StakedEntity {
    pool_id: number
    staker: Name
    staked_quantity: Asset
    last_claimed_at: TimePoint
    tier: number
}

export interface PoolEntity {
    pool_id: number
    reward_pool: {
        quantity: Asset
    }
    emission_rate: number
    emission_unit: number
    is_active: boolean
}

export interface TierEntity {
    tier: number
    required_stake: Asset
    multiplier: number
}

// Analytics Types
export interface PoolHealth {
    percentage: number
    currentLevel: 'critical' | 'warning' | 'healthy'
    lastUpdated: Date
}

export interface PoolAnalytics {
    id: number
    healthPercentage: number
    claimRate: number
    averageStakeTime: number
    topStakers: Array<{account: Name, amount: Asset}>
    recentClaims: Array<{account: Name, amount: Asset}>
    projectedDepletion?: TimePoint
}

export interface ClaimProjection {
    amount: Asset
    change: number
    timestamp: TimePoint
}

// Challenge & Guild Types
export interface Challenge {
    id: number
    name: string
    description: string
    reward: Asset
    expires_at: TimePoint
    starts_at: TimePoint
    required_tier: number
}

export interface GameEvent {
    id: number
    name: string
    description: string
    reward_pool: Asset
    starts_at: TimePoint
    ends_at: TimePoint
    type: 'battle' | 'tournament' | 'special'
}

export interface Guild {
    id: number
    name: string
    leader: Name
    members: Name[]
    total_staked: Asset
}

// UI Component Props
export interface ButtonProps {
    children: React.ReactNode
    variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'warning' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
    disabled?: boolean
    onClick?: () => void | Promise<void>
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    className?: string
}