import { Asset, TimePoint } from '@wharfkit/session'
import { PoolAnalytics } from '../types'
import { GAME_CONFIG } from '../config'

class PoolAnalyticsService {
    private static instance: PoolAnalyticsService
    private poolData: Map<number, PoolAnalytics> = new Map()
    private listeners: Map<number, Set<(data: PoolAnalytics) => void>> = new Map()

    private constructor() {
        this.startPoolMonitoring()
    }

    public static getInstance(): PoolAnalyticsService {
        if (!PoolAnalyticsService.instance) {
            PoolAnalyticsService.instance = new PoolAnalyticsService()
        }
        return PoolAnalyticsService.instance
    }

    private startPoolMonitoring(): void {
        setInterval(() => {
            this.updatePoolAnalytics()
        }, GAME_CONFIG.POOL_HEALTH.UPDATE_INTERVAL)
    }

    private async updatePoolAnalytics(): Promise<void> {
        // In a real implementation, this would fetch data from the blockchain
        // For now, we'll simulate data updates
        this.poolData.forEach((data, poolId) => {
            const updatedData = {
                ...data,
                healthPercentage: this.simulateHealthChange(data.healthPercentage),
                claimRate: this.simulateClaimRate(),
                lastUpdated: new Date()
            }
            this.poolData.set(poolId, updatedData)
            
            // Notify listeners
            const poolListeners = this.listeners.get(poolId)
            if (poolListeners) {
                poolListeners.forEach(listener => listener(updatedData))
            }
        })
    }

    private simulateHealthChange(currentHealth: number): number {
        const change = (Math.random() - 0.5) * 0.01 // -0.5% to +0.5%
        return Math.max(0, Math.min(1, currentHealth + change))
    }

    private simulateClaimRate(): number {
        return Math.random() * 100 // Claims per hour
    }

    subscribeToPool(poolId: number, callback: (data: PoolAnalytics) => void): () => void {
        if (!this.listeners.has(poolId)) {
            this.listeners.set(poolId, new Set())
        }
        
        const poolListeners = this.listeners.get(poolId)!
        poolListeners.add(callback)

        return () => {
            poolListeners.delete(callback)
            if (poolListeners.size === 0) {
                this.listeners.delete(poolId)
            }
        }
    }

    addPoolClaim(
        poolId: number, 
        amount: Asset, 
        timestamp: TimePoint
    ): void {
        const poolData = this.poolData.get(poolId)
        if (poolData) {
            poolData.recentClaims.unshift({
                account: 'example'_n, // This should be the actual claimer
                amount,
                timestamp
            })
            // Keep only recent claims
            poolData.recentClaims = poolData.recentClaims.slice(0, 10)
            this.poolData.set(poolId, poolData)
        }
    }

    getPoolAnalytics(poolId: number): PoolAnalytics | undefined {
        return this.poolData.get(poolId)
    }

    getTopStakers(poolId: number): {account: string, amount: Asset}[] {
        const poolData = this.poolData.get(poolId)
        return poolData?.topStakers || []
    }
}

export default PoolAnalyticsService.getInstance()