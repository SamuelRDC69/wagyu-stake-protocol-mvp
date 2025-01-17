// src/lib/hooks/useTierCalculation.ts
import { useMemo } from 'react';
import { TierEntity, TierProgress } from '../types/tier';
import { StakedEntity } from '../types/staked';
import { PoolEntity } from '../types/pool';
import { parseTokenString } from '../utils/tokenUtils';

export function useTierCalculation(
  stakedData: StakedEntity | undefined,
  poolData: PoolEntity | undefined,
  tiers: TierEntity[]
) {
  return useMemo(() => {
    if (!stakedData || !poolData || !tiers.length) {
      return null;
    }

    try {
      const { amount: stakedAmount } = parseTokenString(stakedData.staked_quantity);
      const { amount: totalStaked } = parseTokenString(poolData.total_staked_quantity);

      if (totalStaked === 0) {
        return {
          currentTier: tiers[0],
          progress: 0,
          nextTier: tiers[1],
          prevTier: undefined,
          stakedAmount: stakedData.staked_quantity,
          totalStaked: poolData.total_staked_quantity,
          currentStakedAmount: stakedAmount,
          requiredForCurrent: 0,
          symbol: 'WAX',
          weight: parseFloat(tiers[0].weight)  // Added weight
        };
      }

      // Calculate percentage with 8 decimal precision
      const stakedPercent = (stakedAmount / totalStaked) * 100;

      // Sort tiers by staked percentage requirement
      const sortedTiers = [...tiers].sort((a, b) => 
        parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
      );

      // Find current tier
      let currentTier = sortedTiers[0];
      let currentTierIndex = 0;

      for (let i = 0; i < sortedTiers.length; i++) {
        if (stakedPercent <= parseFloat(sortedTiers[i].staked_up_to_percent)) {
          currentTier = i > 0 ? sortedTiers[i - 1] : sortedTiers[0];
          currentTierIndex = i > 0 ? i - 1 : 0;
          break;
        }
        if (i === sortedTiers.length - 1) {
          currentTier = sortedTiers[i];
          currentTierIndex = i;
        }
      }

      // Calculate progress
      const nextTier = currentTierIndex < sortedTiers.length - 1 
        ? sortedTiers[currentTierIndex + 1] 
        : undefined;
      const prevTier = currentTierIndex > 0 
        ? sortedTiers[currentTierIndex - 1] 
        : undefined;

      let progress = 100;
      if (nextTier) {
        const range = parseFloat(nextTier.staked_up_to_percent) - parseFloat(currentTier.staked_up_to_percent);
        progress = ((stakedPercent - parseFloat(currentTier.staked_up_to_percent)) / range) * 100;
      }

      const requiredForCurrent = (parseFloat(currentTier.staked_up_to_percent) * totalStaked) / 100;
      const totalAmountForNext = nextTier 
        ? (parseFloat(nextTier.staked_up_to_percent) * totalStaked) / 100 
        : undefined;
      const additionalAmountNeeded = totalAmountForNext && totalAmountForNext > stakedAmount 
        ? totalAmountForNext - stakedAmount 
        : undefined;

      return {
        currentTier,
        nextTier,
        prevTier,
        progress: Math.min(Math.max(0, progress), 100),
        stakedAmount: stakedData.staked_quantity,
        totalStaked: poolData.total_staked_quantity,
        currentStakedAmount: stakedAmount,
        requiredForCurrent,
        symbol: 'WAX',
        totalAmountForNext,
        additionalAmountNeeded,
        weight: parseFloat(currentTier.weight)  // Added correct weight
      };
    } catch (error) {
      console.error('Error calculating tier:', error);
      return null;
    }
  }, [stakedData, poolData, tiers]);
}