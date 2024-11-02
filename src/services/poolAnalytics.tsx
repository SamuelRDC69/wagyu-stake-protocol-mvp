import { PoolAnalytics, PoolEntity } from '../types'
import { GAME_CONFIG } from '../config'
import RpcService from '../blockchain/rpcService'
import { fetchTableData } from '../blockchain/tableQueries'
import { calculatePoolHealth } from '../utils/calculations'

class PoolAnalyticsService {
    private static instance: PoolAnalyticsService
    private analyticsCache: Map<number, PoolAnalytics> = new Map()
    private listeners: Map<number, Set<(data: PoolAnalytics) => void>> = new Map()
    private updateIntervals: Map<number, NodeJS.Timer> = new Map()

    private constructor() {}

    public static getInstance(): PoolAnalyticsService {
        if (!PoolAnalyticsService.instance) {
            PoolAnalyticsService.instance = new PoolAnalyticsService()
        }
        return PoolAnalyticsService.instance
    }

    async startPoolMonitoring(poolId: number): Promise<void> {
        if (this.updateIntervals.has(poolId)) return

        const updatePoolData = async () => {
            try {
                // Fetch latest pool data
                const pools = await fetchTableData.getPools()
                const pool = pools.find(p => p.pool_id === poolId)
                if (!pool) return

                // Calculate analytics
                const analytics = await this.calculatePoolAnalytics(pool)
                this.analyticsCache.set(poolId, analytics)

                // Notify listeners
                const poolListeners = this.listeners.get(poolId)
                if (poolListeners) {
                    poolListeners.forEach(listener => listener(analytics))
                }
            } catch (error) {
                console.error(`Error updating pool ${poolId} data:`, error)
            }
        }

        // Initial update
        await updatePoolData()

        // Set up interval for updates
        const intervalId = setInterval(updatePoolData, GAME_CONFIG.POOL_HEALTH.UPDATE_INTERVAL)
        this.updateIntervals.set(poolId, intervalId)
    }

    private async calculatePoolAnalytics(pool: PoolEntity): Promise<PoolAnalytics> {
        const health = calculatePoolHealth(pool)
        
        // Get recent claims (placeholder implementation)
        const recentClaims = []
        // You would implement actual claim history tracking here
        // This might require indexing claim actions from the blockchain

        return {
            id: pool.pool_id,
            healthPercentage: health.percentage,
            claimRate: await this.calculateClaimRate(pool.pool_id),
            averageStakeTime: await this.calculateAverageStakeTime(pool.pool_id),
            topStakers: await this.getTopStakers(pool.pool_id),
            recentClaims: recentClaims,
            projectedDepletion: this.calculateProjectedDepletion(health.percentage, pool)
        }
    }

    private async calculateClaimRate(poolId: number): Promise<number> {
        // This would require analyzing claim actions over time
        // Placeholder implementation
        return 0
    }

    private async calculateAverageStakeTime(poolId: number): Promise<number> {
        // This would require analyzing stake duration
        // Placeholder implementation
        return 0
    }

    private async getTopStakers(poolId: number): Promise<{account: string, amount: string}[]> {
        // Placeholder implementation
        // Would need to analyze all stakes in the pool
        return []
    }

    private calculateProjectedDepletion(healthPercentage: number, pool: PoolEntity): Date | undefined {
        if (healthPercentage > GAME_CONFIG.POOL_HEALTH.HEALTHY_THRESHOLD) {
            return undefined
        }

        // Basic projection based on emission rate
        const remainingTokens = Number(pool.reward_pool.quantity.value)
        const emissionRate = pool.emission_rate / pool.emission_unit
        const secondsUntilDepletion = remainingTokens / emissionRate

        return new Date(Date.now() + (secondsUntilDepletion * 1000))
    }

    subscribeToPool(poolId: number, callback: (data: PoolAnalytics) => void): () => void {
        if (!this.listeners.has(poolId)) {
            this.listeners.set(poolId, new Set())
            this.startPoolMonitoring(poolId)
        }

        const poolListeners = this.listeners.get(poolId)!
        poolListeners.add(callback)

        // Return unsubscribe function
        return () => {
            poolListeners.delete(callback)
            if (poolListeners.size === 0) {
                this.listeners.delete(poolId)
                const intervalId = this.updateIntervals.get(poolId)
                if (intervalId) {
                    clearInterval(intervalId)
                    this.updateIntervals.delete(poolId)
                }
            }
        }
    }
}

export default PoolAnalyticsService.getInstance()