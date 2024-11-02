import { ReactNode } from 'react'

// Game-specific configuration parameters
export const GAME_CONFIG = {
    // Claim projection settings
    CLAIM_PROJECTION: {
        UPDATE_INTERVAL: 5000, // Update every 5 seconds
        MAX_PROJECTION_HOURS: 24,
        MIN_CLAIM_AMOUNT: 0.0001
    },

    // Pool health thresholds
    POOL_HEALTH: {
        CRITICAL_THRESHOLD: 0.2, // 20% remaining
        WARNING_THRESHOLD: 0.4, // 40% remaining
        HEALTHY_THRESHOLD: 0.7, // 70% remaining
        UPDATE_INTERVAL: 10000 // Update every 10 seconds
    },

    // Risk meter configuration
    RISK_METER: {
        HIGH_RISK_THRESHOLD: 0.7, // 70% of users near claim time
        MEDIUM_RISK_THRESHOLD: 0.4,
        UPDATE_INTERVAL: 15000 // Update every 15 seconds
    },

    // Guild system parameters
    GUILD: {
        MIN_MEMBERS: 3,
        MAX_MEMBERS: 50,
        MIN_STAKE_TO_CREATE: 100, // Minimum stake to create guild
        BATTLE_DURATION_HOURS: 48, // Weekend battles last 48 hours
        REWARD_DISTRIBUTION: {
            FIRST_PLACE: 0.5, // 50% of reward pool
            SECOND_PLACE: 0.3,
            THIRD_PLACE: 0.2
        }
    },

    // Challenge system configuration
    CHALLENGES: {
        DAILY: {
            RESET_HOUR: 0, // UTC
            MIN_REWARDS: 1,
            MAX_REWARDS: 10
        },
        WEEKLY: {
            RESET_DAY: 1, // Monday
            MIN_REWARDS: 10,
            MAX_REWARDS: 100
        }
    },

    // UI refresh rates
    UI: {
        ANIMATION_DURATION: 500,
        TOAST_DURATION: 3000,
        LOADER_DELAY: 500
    },

    // Tier visualization
    TIERS: {
        COLORS: {
            BRONZE: '#CD7F32',
            SILVER: '#C0C0C0',
            GOLD: '#FFD700',
            PLATINUM: '#E5E4E2',
            DIAMOND: '#B9F2FF'
        }
    }
} as const

// Game event types
export const EVENT_TYPES = {
    DAILY_MISSION: 'daily_mission',
    WEEKLY_TOURNAMENT: 'weekly_tournament',
    GUILD_BATTLE: 'guild_battle',
    SPECIAL_EVENT: 'special_event'
} as const

// Achievement categories
export const ACHIEVEMENT_TYPES = {
    STAKING_MILESTONE: 'staking_milestone',
    CLAIM_STREAK: 'claim_streak',
    GUILD_CONTRIBUTION: 'guild_contribution',
    CHALLENGE_MASTER: 'challenge_master'
} as const

// Toast message configurations
export interface ToastConfig {
    duration?: number
    type: 'success' | 'error' | 'info' | 'warning'
    title: string
    message: ReactNode
}