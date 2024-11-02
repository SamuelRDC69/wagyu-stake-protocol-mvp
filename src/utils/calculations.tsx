import { Asset, TimePoint } from '@wharfkit/session'
import { PoolEntity, PoolHealth, ClaimProjection } from '../types'
import { GAME_CONFIG } from '../config'

export const calculatePoolHealth = (pool: PoolEntity): PoolHealth => {
    const totalRewards = Number(pool.reward_pool.quantity.value)
    const totalStaked = Number(pool.total_staked_quantity.value)
    const healthPercentage = totalRewards / (totalStaked + totalRewards)

    let currentLevel: 'critical' | 'warning' | 'healthy'
    if (healthPercentage <= GAME_CONFIG.POOL_HEALTH.CRITICAL_THRESHOLD) {
        currentLevel = 'critical'
    } else if (healthPercentage <= GAME_CONFIG.POOL_HEALTH.WARNING_THRESHOLD) {
        currentLevel = 'warning'
    } else {
        currentLevel = 'healthy'
    }

    return {
        currentLevel,
        percentage: healthPercentage,
        trend: 'stable', // This should be calculated based on historical data
        recentImpact: []
    }
}

export const calculateClaimProjection = (
    pool: PoolEntity,
    stakedAmount: Asset,
    lastClaimTime: TimePoint
): ClaimProjection => {
    // Calculate emission rate per second
    const emissionRate = pool.emission_rate / pool.emission_unit

    // Calculate time since last claim
    const now = new Date()
    const lastClaim = new Date(lastClaimTime.toString())
    const timeDiffSeconds = (now.getTime() - lastClaim.getTime()) / 1000

    // Calculate projected rewards
    const projectedRewards = emissionRate * timeDiffSeconds * Number(stakedAmount.value)

    // Determine risk level based on pool health
    const poolHealth = calculatePoolHealth(pool)
    let riskLevel: 'low' | 'medium' | 'high'
    
    if (poolHealth.percentage > GAME_CONFIG.RISK_METER.HIGH_RISK_THRESHOLD) {
        riskLevel = 'low'
    } else if (poolHealth.percentage > GAME_CONFIG.RISK_METER.MEDIUM_RISK_THRESHOLD) {
        riskLevel = 'medium'
    } else {
        riskLevel = 'high'
    }

    return {
        estimatedReward: Asset.from(`${projectedRewards.toFixed(4)} ${pool.reward_pool.quantity.symbol}`),
        optimalClaimTime: TimePoint.from(new Date(now.getTime() + 3600000).toISOString()), // +1 hour example
        riskLevel,
        potentialBonus: undefined // Implement bonus calculation if applicable
    }
}

export const calculateTierProgress = (
    currentStake: number,
    nextTierRequirement: number
): number => {
    return Math.min((currentStake / nextTierRequirement) * 100, 100)
}

export const calculateGuildContribution = (
    memberStake: number,
    totalGuildStake: number
): number => {
    return (memberStake / totalGuildStake) * 100
}

export const calculateCooldownProgress = (
    lastClaimTime: TimePoint,
    cooldownPeriod: number
): number => {
    const now = new Date().getTime()
    const claimTime = new Date(lastClaimTime.toString()).getTime()
    const progress = ((now - claimTime) / (cooldownPeriod * 1000)) * 100
    return Math.min(progress, 100)
}