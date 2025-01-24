import { useCallback } from 'react';
import { useGameData } from '../contexts/GameDataContext';
import { parseTokenString } from '../utils/tokenUtils';

export function useGameActions() {
  const { gameData, updatePoolStats, updateStake, removeStake } = useGameData();

  const handleStakeSuccess = useCallback((
    poolId: number,
    owner: string,
    stakeAmount: string,
    symbol: string
  ) => {
    const pool = gameData.pools.find(p => p.pool_id === poolId);
    if (!pool) return;

    // Update pool total staked
    const { amount: currentStaked } = parseTokenString(pool.total_staked_quantity);
    const { amount: stakeValue } = parseTokenString(stakeAmount);
    const newTotal = currentStaked + stakeValue;

    updatePoolStats(poolId, {
      total_staked_quantity: `${newTotal.toFixed(8)} ${symbol}`
    });

    // Update or create stake
    const existingStake = gameData.stakes.find(
      s => s.pool_id === poolId && s.owner === owner
    );

    if (existingStake) {
      const { amount: currentAmount } = parseTokenString(existingStake.staked_quantity);
      updateStake(poolId, owner, {
        staked_quantity: `${(currentAmount + stakeValue).toFixed(8)} ${symbol}`,
        last_claimed_at: new Date().toISOString(),
        cooldown_end_at: new Date(
          Date.now() + (gameData.config?.cooldown_seconds_per_claim ?? 60) * 1000
        ).toISOString()
      });
    } else {
      // Logic for new stake would go here
    }
  }, [gameData, updatePoolStats, updateStake]);

  const handleUnstakeSuccess = useCallback((
    poolId: number,
    owner: string,
    unstakeAmount: string,
    symbol: string
  ) => {
    const pool = gameData.pools.find(p => p.pool_id === poolId);
    if (!pool) return;

    // Update pool total staked
    const { amount: currentStaked } = parseTokenString(pool.total_staked_quantity);
    const { amount: unstakeValue } = parseTokenString(unstakeAmount);
    const newTotal = currentStaked - unstakeValue;

    updatePoolStats(poolId, {
      total_staked_quantity: `${newTotal.toFixed(8)} ${symbol}`
    });

    // Update stake
    const existingStake = gameData.stakes.find(
      s => s.pool_id === poolId && s.owner === owner
    );

    if (existingStake) {
      const { amount: currentAmount } = parseTokenString(existingStake.staked_quantity);
      const newAmount = currentAmount - unstakeValue;

      if (newAmount <= 0) {
        removeStake(poolId, owner);
      } else {
        updateStake(poolId, owner, {
          staked_quantity: `${newAmount.toFixed(8)} ${symbol}`,
          last_claimed_at: new Date().toISOString(),
          cooldown_end_at: new Date(
            Date.now() + (gameData.config?.cooldown_seconds_per_claim ?? 60) * 1000
          ).toISOString()
        });
      }
    }
  }, [gameData, updatePoolStats, updateStake, removeStake]);

  const handleClaimSuccess = useCallback((
    poolId: number,
    owner: string,
    claimAmount: string
  ) => {
    const pool = gameData.pools.find(p => p.pool_id === poolId);
    if (!pool) return;

    // Update pool rewards
    const { amount: currentRewards } = parseTokenString(pool.reward_pool.quantity);
    const { amount: claimValue } = parseTokenString(claimAmount);
    const newRewards = currentRewards - claimValue;

    updatePoolStats(poolId, {
      reward_pool: {
        ...pool.reward_pool,
        quantity: `${newRewards.toFixed(8)} ${pool.reward_pool.quantity.split(' ')[1]}`
      }
    });

    // Update stake cooldown
    const existingStake = gameData.stakes.find(
      s => s.pool_id === poolId && s.owner === owner
    );

    if (existingStake) {
      updateStake(poolId, owner, {
        last_claimed_at: new Date().toISOString(),
        cooldown_end_at: new Date(
          Date.now() + (gameData.config?.cooldown_seconds_per_claim ?? 60) * 1000
        ).toISOString()
      });
    }
  }, [gameData, updatePoolStats, updateStake]);

  return {
    handleStakeSuccess,
    handleUnstakeSuccess,
    handleClaimSuccess
  };
}