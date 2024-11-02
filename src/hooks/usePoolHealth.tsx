import { useState, useEffect, useCallback } from 'react'
import { PoolAnalyticsService } from '../services'
import { PoolAnalytics, PoolHealth } from '../types'
import { calculatePoolHealth } from '../utils/calculations'
import { GAME_CONFIG } from '../config'

export const usePoolHealth = (poolId: number) => {
    const [analytics, setAnalytics] = useState<PoolAnalytics | undefined>()
    const [health, setHealth] = useState<PoolHealth | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsLoading(true)
        // Get initial analytics
        const initialAnalytics = PoolAnalyticsService.getPoolAnalytics(poolId)
        if (initialAnalytics) {
            setAnalytics(initialAnalytics)
            setHealth(calculatePoolHealth(initialAnalytics.pool))
        }
        setIsLoading(false)

        // Subscribe to pool analytics updates
        const unsubscribe = PoolAnalyticsService.subscribeToPool(
            poolId,
            (updatedAnalytics) => {
                setAnalytics(updatedAnalytics)
                setHealth(calculatePoolHealth(updatedAnalytics.pool))
            }
        )

        return () => unsubscribe()
    }, [poolId])

    const getRiskLevel = useCallback((): 'low' | 'medium' | 'high' => {
        if (!health) return 'medium'

        if (health.percentage >= GAME_CONFIG.POOL_HEALTH.HEALTHY_THRESHOLD) {
            return 'low'
        } else if (health.percentage >= GAME_CONFIG.POOL_HEALTH.WARNING_THRESHOLD) {
            return 'medium'
        } else {
            return 'high'
        }
    }, [health])

    const getTopStakers = useCallback(() => {
        return analytics?.topStakers || []
    }, [analytics])

    const getRecentClaims = useCallback(() => {
        return analytics?.recentClaims || []
    }, [analytics])

    return {
        health,
        analytics,
        isLoading,
        getRiskLevel,
        getTopStakers,
        getRecentClaims,
        healthPercentage: health?.percentage || 0,
        healthStatus: health?.currentLevel || 'critical',
        claimRate: analytics?.claimRate || 0
    }
}