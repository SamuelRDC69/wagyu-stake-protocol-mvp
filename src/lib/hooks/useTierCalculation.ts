import { useMemo } from 'react';
import { TierEntity, TierProgress } from '../types/tier';
import { StakedEntity } from '../types/staked';
import { PoolEntity } from '../types/pool';
import { parseTokenString } from '../utils/tokenUtils';
import { TIER_CONFIG } from '../config/tierConfig';

const TIER_PRECISION = 8; // For WAX decimal precision
const TIER_KEYS = Object.keys(TIER_CONFIG);

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
      const { amount: stakedAmount, symbol } = parseTokenString(stakedData.staked_quantity);
      const { amount: totalStaked } = parseTokenString(poolData.total_staked_quantity);

      // Handle empty pool case
      if (totalStaked === 0) {
        const lowestTier = tiers[0];
        return {
          currentTier: lowestTier,
          progress: 0,
          nextTier: tiers[1],
          prevTier: undefined,
          stakedAmount: stakedData.staked_quantity,
          totalStaked: poolData.total_staked_quantity,
          currentStakedAmount: stakedAmount,
          requiredForCurrent: 0,
          symbol,
          totalAmountForNext: undefined,
          additionalAmountNeeded: undefined,
          weight: parseFloat(lowestTier.weight)
        };
      }

      // Calculate staked percentage with precision
      const stakedPercent = Number(((stakedAmount / totalStaked) * 100).toFixed(TIER_PRECISION));

      // Sort tiers by staked percentage requirement
      const sortedTiers = [...tiers].sort((a, b) => 
        parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
      );

      // Find the tier where the staked percentage is less than or equal to the threshold
      let currentTier = sortedTiers[0];
      let currentTierIndex = 0;

      for (let i = 0; i < sortedTiers.length; i++) {
        const tierThreshold = parseFloat(sortedTiers[i].staked_up_to_percent);
        
        if (stakedPercent <= tierThreshold) {
          currentTier = sortedTiers[i];
          currentTierIndex = i;
          break;
        }
        
        // If we've reached the last tier and haven't found a match,
        // use the last tier
        if (i === sortedTiers.length - 1) {
          currentTier = sortedTiers[i];
          currentTierIndex = i;
        }
      }

      // Get adjacent tiers
      const nextTier = currentTierIndex < sortedTiers.length - 1 
        ? sortedTiers[currentTierIndex + 1] 
        : undefined;
      const prevTier = currentTierIndex > 0 
        ? sortedTiers[currentTierIndex - 1] 
        : undefined;

      // Calculate progress percentage within current tier
      let progress = 0;
      const currentThreshold = parseFloat(currentTier.staked_up_to_percent);
      
      if (currentTierIndex === 0) {
        // For the first tier, calculate progress as percentage of threshold
        progress = (stakedPercent / currentThreshold) * 100;
      } else {
        // For other tiers, calculate progress from previous tier to current tier
        const prevThreshold = parseFloat(prevTier!.staked_up_to_percent);
        progress = ((stakedPercent - prevThreshold) / (currentThreshold - prevThreshold)) * 100;
      }

      // Calculate amounts needed for current and next tiers
      const requiredForCurrent = (parseFloat(currentTier.staked_up_to_percent) * totalStaked) / 100;
      const totalAmountForNext = nextTier 
        ? (parseFloat(nextTier.staked_up_to_percent) * totalStaked) / 100 
        : undefined;
      
      // Calculate additional amount needed for next tier
      const additionalAmountNeeded = totalAmountForNext && totalAmountForNext > stakedAmount 
        ? Number((totalAmountForNext - stakedAmount).toFixed(TIER_PRECISION))
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
        symbol,
        totalAmountForNext: totalAmountForNext ? Number(totalAmountForNext.toFixed(TIER_PRECISION)) : undefined,
        additionalAmountNeeded,
        weight: parseFloat(currentTier.weight)
      };
    } catch (error) {
      console.error('Error calculating tier:', error);
      return null;
    }
  }, [stakedData, poolData, tiers]);
}