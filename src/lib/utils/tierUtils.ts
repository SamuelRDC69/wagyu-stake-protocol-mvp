import { TierEntity, TierProgress } from '../types/tier';
import { StakedEntity } from '../types/staked';
import { PoolEntity } from '../types/pool';
import { parseTokenString } from './tokenUtils';

export const calculateTierProgress = (
  stakedAmount: string,
  totalStaked: string,
  tiers: TierEntity[]
): TierProgress | null => {
  try {
    // Parse the staked amounts first
    const stakedValue = parseFloat(stakedAmount.split(' ')[0]);
    const totalValue = parseFloat(totalStaked.split(' ')[0]);
    
    if (isNaN(stakedValue) || isNaN(totalValue) || totalValue === 0) {
      return null;
    }

    // Calculate percentage like the smart contract
    let stakedPercent = (stakedValue / totalValue) * 100;
    stakedPercent = Math.min(stakedPercent, 100); // Cap at 100% like the contract

    // Sort tiers by staked_up_to_percent ASCENDING (like the contract's index)
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    // Find first tier where threshold >= user percentage (mimic lower_bound)
    const tierIndex = sortedTiers.findIndex(
      tier => parseFloat(tier.staked_up_to_percent) >= stakedPercent
    );

    if (tierIndex === -1) {
      // If no tier found, use the highest tier
      const highestTier = sortedTiers[sortedTiers.length - 1];
      return {
        currentTier: highestTier,
        progress: 100,
        requiredForCurrent: parseFloat(highestTier.staked_up_to_percent)
      };
    }

    const currentTier = sortedTiers[tierIndex];
    const prevTier = tierIndex > 0 ? sortedTiers[tierIndex - 1] : undefined;
    const nextTier = tierIndex < sortedTiers.length - 1 ? sortedTiers[tierIndex + 1] : undefined;

    // Calculate progress
    const currentThreshold = parseFloat(currentTier.staked_up_to_percent);
    const prevThreshold = prevTier ? parseFloat(prevTier.staked_up_to_percent) : 0;
    
    const progress = prevThreshold === currentThreshold 
      ? 100 
      : ((stakedPercent - prevThreshold) / (currentThreshold - prevThreshold)) * 100;

    return {
      currentTier,
      nextTier,
      prevTier,
      progress: Math.min(Math.max(0, progress), 100),
      requiredForNext: nextTier ? parseFloat(nextTier.staked_up_to_percent) : undefined,
      requiredForCurrent: currentThreshold
    };
  } catch (error) {
    console.error('Error in calculateTierProgress:', error);
    return null;
  }
};

export const getTierColor = (tier: string): string => {
  switch (tier.toLowerCase()) {
    case 'bronze': return 'text-amber-500';
    case 'silver': return 'text-slate-300';
    case 'gold': return 'text-yellow-500';
    default: return 'text-purple-500';
  }
};

export const isTierUpgradeAvailable = (
  currentStaked: string,
  totalStaked: string,
  currentTier: TierEntity,
  tiers: TierEntity[]
): boolean => {
  try {
    const stakedValue = parseFloat(currentStaked.split(' ')[0]);
    const totalValue = parseFloat(totalStaked.split(' ')[0]);
    const stakedPercent = (stakedValue / totalValue) * 100;
    
    // Sort tiers in descending order
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(b.staked_up_to_percent) - parseFloat(a.staked_up_to_percent)
    );
    
    // Find index of current tier
    const currentTierIndex = sortedTiers.findIndex(
      t => t.tier === currentTier.tier
    );
    
    // If not the highest tier and exceeds current tier's threshold
    if (currentTierIndex > 0) {
      const nextTierThreshold = parseFloat(sortedTiers[currentTierIndex - 1].staked_up_to_percent);
      return stakedPercent >= nextTierThreshold;
    }
    
    return false;
  } catch (error) {
    console.error('Error in isTierUpgradeAvailable:', error);
    return false;
  }
};