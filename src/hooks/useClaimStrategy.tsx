import { useState, useEffect, useCallback } from 'react'
import { usePoolHealth } from './usePoolHealth'
import { useCooldown } from './useCooldown'
import { GAME_CONFIG } from '../config'
import { StakedEntity, ClaimProjection } from '../types'

export const useClaimStrategy = (
    poolId: number,
    stake?: StakedEntity
) => {
    const { health, claimRate } = usePoolHealth(poolId)
    const { isReady, timeRemaining } = useCooldown(stake)
    const [optimalClaimTime, setOptimalClaimTime] = useState<Date | null>(null)
    const [projectedReward, setProjectedReward] = useState<ClaimProjection | null>(null)

    useEffect(() => {
        if (!health || !stake) return

        const calculateOptimalTime = () => {
            // Complex calculation considering:
            // 1. Pool health
            // 2. Current claim rate
            // 3. User's tier
            // 4. Historical claim patterns
            const now = new Date()
            const optimalDelay = calculateOptimalDelay(health.percentage, claimRate)
            setOptimalClaimTime(new Date(now.getTime() + optimalDelay))
        }

        calculateOptimalTime()
    }, [health, stake, claimRate])

    const calculateOptimalDelay = (poolHealth: number, currentClaimRate: number): number => {
        if (poolHealth < GAME_CONFIG.POOL_HEALTH.CRITICAL_THRESHOLD) {
            return 3600000 // Wait 1 hour if pool health is critical
        }
        
        if (currentClaimRate > 50) { // High claim rate
            return 1800000 // Wait 30 minutes
        }

        return 0 // Claim now
    }

    const getClaimAdvice = useCallback((): string => {
        if (!isReady) {
            return `Wait for cooldown: ${Math.ceil(timeRemaining / 60)} minutes remaining`
        }

        if (!health) return 'Loading pool health...'

        if (health.percentage < GAME_CONFIG.POOL_HEALTH.CRITICAL_THRESHOLD) {
            return 'Pool health critical. Consider waiting.'
        }

        if (claimRate > 50) {
            return 'High claim rate. Consider waiting for better timing.'
        }

        return 'Optimal time to claim!'
    }, [isReady, timeRemaining, health, claimRate])

    const getRewardEstimate = useCallback((): string => {
        if (!projectedReward) return 'Calculating...'
        return projectedReward.estimatedReward.toString()
    }, [projectedReward])

    return {
        optimalClaimTime,
        projectedReward,
        getClaimAdvice,
        getRewardEstimate,
        isOptimalTime: optimalClaimTime ? new Date() >= optimalClaimTime : false
    }
}