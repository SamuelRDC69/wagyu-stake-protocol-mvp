import { useState, useEffect, useCallback } from 'react'
import { PoolAnalyticsService } from '../services'
import { fetchTableData } from '../blockchain/tableQueries'
import { PoolAnalytics, PoolHealth } from '../types'
import { calculatePoolHealth } from '../utils/calculations'
import { GAME_CONFIG } from '../config'

export const usePoolHealth = (poolId: number) => {
    const [analytics, setAnalytics] = useState<PoolAnalytics | undefined>()
    const [health, setHealth] = useState<PoolHealth | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Initial data fetch and subscription setup
    useEffect(() => {
        let isMounted = true
        setIsLoading(true)

        const fetchInitialData = async () => {
            try {
                // Get pool data from blockchain
                const pools = await fetchTableData.getPools()
                const pool = pools.find(p => p.pool_id === poolId)
                
                if (pool && isMounted) {
                    // Calculate initial health
                    const initialHealth = calculatePoolHealth(pool)
                    setHealth(initialHealth)
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to fetch pool data')
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        fetchInitialData()

        // Subscribe to analytics updates
        const unsubscribe = PoolAnalyticsService.getInstance().subscribeToPool(
            poolId,
            (updatedAnalytics) => {
                if (isMounted) {
                    setAnalytics(updatedAnalytics)
                }
            }
        )

        return () => {
            isMounted = false
            unsubscribe()
        }
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
        error,
        getRiskLevel,
        getTopStakers,
        getRecentClaims,
        healthPercentage: health?.percentage || 0,
        healthStatus: health?.currentLevel || 'critical',
        claimRate: analytics?.claimRate || 0
    }
}