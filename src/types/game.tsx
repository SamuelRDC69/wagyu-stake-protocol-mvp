import { Asset, Name, TimePoint } from '@wharfkit/session'
import { ACHIEVEMENT_TYPES, EVENT_TYPES } from '../config'
import { ReactNode } from 'react'

// Component Props Types
export interface BaseComponentProps {
    children?: ReactNode
    className?: string
}

// User Profile
export interface UserProfile {
    account: Name
    currentTier: TierInfo
    totalStaked: Asset
    totalClaimed: Asset
    lastClaimTime: TimePoint
    achievements: Achievement[]
    guildId?: number
}

export interface TierInfo {
    tier: Name
    name: string
    weight: number
    requiredStake: Asset
    color: string
    nextTier?: {
        name: string
        remainingStake: Asset
    }
}

// Guild System
export interface Guild {
    id: number
    name: string
    leader: Name
    totalStaked: Asset
    memberCount: number
    ranking: number
    weeklyRewards: Asset
    members: GuildMember[]
    battlesWon: number
}

export interface GuildMember {
    account: Name
    stakedAmount: Asset
    contributionScore: number
    joinedAt: TimePoint
    lastActive: TimePoint
}

// Challenge System
export interface Challenge {
    id: number
    type: typeof EVENT_TYPES[keyof typeof EVENT_TYPES]
    title: string
    description: string
    reward: Asset
    startTime: TimePoint
    endTime: TimePoint
    requirements: ChallengeRequirement[]
    participants: ChallengeParticipant[]
}

export interface ChallengeRequirement {
    type: 'stake' | 'claim' | 'duration' | 'guild'
    target: number
    progress: number
}

export interface ChallengeParticipant {
    account: Name
    progress: number
    completed: boolean
    rewardClaimed: boolean
}

// Achievement System
export interface Achievement {
    id: number
    type: typeof ACHIEVEMENT_TYPES[keyof typeof ACHIEVEMENT_TYPES]
    title: string
    description: string
    earnedAt: TimePoint
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

// Pool Analytics
export interface PoolAnalytics {
    id: number
    healthPercentage: number
    claimRate: number
    averageStakeTime: number
    topStakers: {
        account: Name
        amount: Asset
    }[]
    recentClaims: {
        account: Name
        amount: Asset
        timestamp: TimePoint
    }[]
    projectedDepletion?: TimePoint
}

// UI Component Props
export interface ClaimProjectionProps extends BaseComponentProps {
    poolId: number
    userStake: Asset
    onClaimClick: () => void
}

export interface PoolHealthProps extends BaseComponentProps {
    poolId: number
    showDetails?: boolean
}

export interface TierBadgeProps extends BaseComponentProps {
    tier: TierInfo
    animate?: boolean
}

export interface GuildLeaderboardProps extends BaseComponentProps {
    limit?: number
    highlightGuildId?: number
}

// UI States
export interface ClaimProjection {
    estimatedReward: Asset
    optimalClaimTime: TimePoint
    riskLevel: 'low' | 'medium' | 'high'
    potentialBonus?: Asset
}

export interface PoolHealth {
    currentLevel: 'critical' | 'warning' | 'healthy'
    percentage: number
    trend: 'increasing' | 'stable' | 'decreasing'
    recentImpact: {
        amount: Asset
        timestamp: TimePoint
        impact: number
    }[]
}

// Game Events
export interface GameEvent {
    type: typeof EVENT_TYPES[keyof typeof EVENT_TYPES]
    status: 'upcoming' | 'active' | 'completed'
    startTime: TimePoint
    endTime: TimePoint
    reward: Asset
    participantCount: number
    description: string
}