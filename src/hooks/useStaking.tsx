import { useState, useEffect, useCallback } from 'react'
import { WharfKitService, NotificationService } from '../services'
import { Asset, TimePoint } from '@wharfkit/session'
import { StakedEntity, TierEntity, PoolEntity } from '../types'
import { useSession } from './useSession'
import { calculateClaimProjection } from '../utils/calculations'

export const useStaking = (poolId: number) => {
    const { session } = useSession()
    const [stakes, setStakes] = useState<StakedEntity[]>([])
    const [pool, setPool] = useState<PoolEntity | null>(null)
    const [tier, setTier] = useState<TierEntity | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch initial data
    useEffect(() => {
        if (!session) return

        const loadData = async () => {
            try {
                setIsLoading(true)
                const [userStakes, pools, tiers] = await Promise.all([
                    WharfKitService.getUserStakes(session.actor),
                    WharfKitService.getPools(),
                    WharfKitService.getTiers()
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
        }

        loadData()
    }, [session, poolId])

    // Subscribe to stake updates
    useEffect(() => {
        if (!session) return

        const unsubscribe = WharfKitService.subscribeToUserStakes(
            session.actor,
            (updatedStakes) => setStakes(updatedStakes)
        )

        return () => unsubscribe()
    }, [session])

    const stake = useCallback(async (amount: Asset) => {
        if (!session) return false

        try {
            setIsLoading(true)
            setError(null)
            const success = await WharfKitService.stake(amount)
            if (success) {
                NotificationService.stakeSuccess(amount)
                // Refresh stakes
                const updatedStakes = await WharfKitService.getUserStakes(session.actor)
                setStakes(updatedStakes)
            }
            return success
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to stake'
            setError(errorMessage)
            NotificationService.stakeFailed(errorMessage)
            return false
        } finally {
            setIsLoading(false)
        }
    }, [session])

    const unstake = useCallback(async (amount: Asset) => {
        if (!session || !pool) return false

        try {
            setIsLoading(true)
            setError(null)
            const success = await WharfKitService.unstake(poolId, amount)
            if (success) {
                const updatedStakes = await WharfKitService.getUserStakes(session.actor)
                setStakes(updatedStakes)
            }
            return success
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to unstake')
            return false
        } finally {
            setIsLoading(false)
        }
    }, [session, pool, poolId])

    const claim = useCallback(async () => {
        if (!session || !pool) return false

        try {
            setIsLoading(true)
            setError(null)
            const success = await WharfKitService.claim(poolId)
            if (success) {
                const updatedStakes = await WharfKitService.getUserStakes(session.actor)
                setStakes(updatedStakes)
            }
            return success
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to claim')
            return false
        } finally {
            setIsLoading(false)
        }
    }, [session, pool, poolId])

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