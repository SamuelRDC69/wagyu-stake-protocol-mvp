import { useState, useEffect, useCallback } from 'react'
import { Asset } from '@wharfkit/session'
import { StakedEntity, TierEntity, PoolEntity } from '../types'
import WharfKitService from '../services/wharfkit'
import { fetchTableData } from '../blockchain/tableQueries'
import { useSession } from './useSession'
import { NotificationService } from '../services'
import { calculateClaimProjection } from '../utils/calculations'

export const useStaking = (poolId: number) => {
    const { session } = useSession()
    const [stakes, setStakes] = useState<StakedEntity[]>([])
    const [pool, setPool] = useState<PoolEntity | null>(null)
    const [tier, setTier] = useState<TierEntity | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch data function
    const fetchData = useCallback(async () => {
        if (!session?.actor) return

        try {
            setIsLoading(true)
            setError(null)

            // Fetch data in parallel
            const [userStakes, pools, tiers] = await Promise.all([
                fetchTableData.getUserStakes(session.actor.toString()),
                fetchTableData.getPools(),
                fetchTableData.getTiers()
            ])

            const currentPool = pools.find(p => p.pool_id === poolId)
            const currentStake = userStakes.find(s => s.pool_id === poolId)
            const currentTier = currentStake ? tiers.find(t => t.tier === currentStake.tier) : null

            setStakes(userStakes)
            setPool(currentPool || null)
            setTier(currentTier || null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch staking data')
        } finally {
            setIsLoading(false)
        }
    }, [session, poolId])

    // Initial data fetch
    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Set up polling for updates
    useEffect(() => {
        if (!session?.actor) return

        const pollInterval = setInterval(fetchData, 5000) // Poll every 5 seconds
        return () => clearInterval(pollInterval)
    }, [session, fetchData])

    // Staking actions
    const stake = useCallback(async (amount: Asset) => {
        if (!session) return false

        try {
            setIsLoading(true)
            setError(null)
            const success = await WharfKitService.stake(amount)
            if (success) {
                await fetchData() // Refresh data after successful stake
            }
            return success
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to stake'
            setError(errorMessage)
            NotificationService.getInstance().error('Stake Failed', errorMessage)
            return false
        } finally {
            setIsLoading(false)
        }
    }, [session, fetchData])

    const unstake = useCallback(async (amount: Asset) => {
        if (!session || !pool) return false

        try {
            setIsLoading(true)
            setError(null)
            const success = await WharfKitService.unstake(poolId, amount)
            if (success) {
                await fetchData() // Refresh data after successful unstake
            }
            return success
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to unstake'
            setError(errorMessage)
            NotificationService.getInstance().error('Unstake Failed', errorMessage)
            return false
        } finally {
            setIsLoading(false)
        }
    }, [session, pool, poolId, fetchData])

    const claim = useCallback(async () => {
        if (!session || !pool) return false

        try {
            setIsLoading(true)
            setError(null)
            const success = await WharfKitService.claim(poolId)
            if (success) {
                await fetchData() // Refresh data after successful claim
            }
            return success
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to claim'
            setError(errorMessage)
            NotificationService.getInstance().error('Claim Failed', errorMessage)
            return false
        } finally {
            setIsLoading(false)
        }
    }, [session, pool, poolId, fetchData])

    const getClaimProjection = useCallback(() => {
        if (!pool || !tier || stakes.length === 0) return null

        const stake = stakes.find(s => s.pool_id === poolId)
        if (!stake) return null

        return calculateClaimProjection(
            pool,
            stake.staked_quantity,
            stake.last_claimed_at
        )
    }, [pool, tier, stakes, poolId])

    return {
        stakes,
        pool,
        tier,
        isLoading,
        error,
        stake,
        unstake,
        claim,
        getClaimProjection,
        canClaim: pool?.is_active && !isLoading,
        currentStake: stakes.find(s => s.pool_id === poolId)
    }
}