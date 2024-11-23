import { TierEntity, TierProgress } from '../types/tier';
import { StakedEntity } from '../types/staked';
import { PoolEntity } from '../types/pool';
import { parseTokenString } from './tokenUtils';

export const calculateTierProgress = (
  stakedAmount: string,
  totalStaked: string,
  tiers: TierEntity[]
): TierProgress | null => {
  console.log('Calculate Tier Progress Input:', {
    stakedAmount,
    totalStaked,
    tiers
  });

  try {
    // Parse the staked amounts first
    const stakedValue = parseFloat(stakedAmount.split(' ')[0]);
    const totalValue = parseFloat(totalStaked.split(' ')[0]);
    
    if (isNaN(stakedValue) || isNaN(totalValue) || totalValue === 0) {
      console.log('Invalid staked values:', { stakedValue, totalValue });
      return null;
    }

    // Calculate percentage
    const stakedPercent = (stakedValue / totalValue) * 100;
    console.log('User staked percent:', stakedPercent);

    // Sort tiers by staked_up_to_percent in DESCENDING order
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(b.staked_up_to_percent) - parseFloat(a.staked_up_to_percent)
    );
    
    console.log('Sorted tiers:', sortedTiers.map(t => ({
      name: t.tier_name,
      threshold: t.staked_up_to_percent
    })));

    // Find the first tier where the user's percentage is less than or equal to the threshold
    let currentTier = sortedTiers[sortedTiers.length - 1]; // Default to lowest tier
    let nextTier: TierEntity | undefined;
    let prevTier: TierEntity | undefined;

    for (let i = 0; i < sortedTiers.length; i++) {
      const threshold = parseFloat(sortedTiers[i].staked_up_to_percent);
      if (stakedPercent <= threshold) {
        currentTier = sortedTiers[i];
        nextTier = i > 0 ? sortedTiers[i - 1] : undefined;
        prevTier = i < sortedTiers.length - 1 ? sortedTiers[i + 1] : undefined;
        console.log('Found tier match:', {
          tier: currentTier.tier_name,
          threshold,
          stakedPercent,
          next: nextTier?.tier_name,
          prev: prevTier?.tier_name
        });
        break;
      }
    }

    // Calculate progress between tiers
    const currentThreshold = parseFloat(currentTier.staked_up_to_percent);
    const prevThreshold = prevTier ? parseFloat(prevTier.staked_up_to_percent) : 0;
    
    const progress = ((stakedPercent - prevThreshold) / (currentThreshold - prevThreshold)) * 100;

    const result = {
      currentTier,
      nextTier,
      prevTier,
      progress: Math.min(Math.max(0, progress), 100), // Clamp between 0 and 100
      requiredForNext: nextTier ? parseFloat(nextTier.staked_up_to_percent) : undefined,
      requiredForCurrent: currentThreshold
    };

    console.log('Final tier calculation result:', {
      stakedPercent,
      currentTierName: currentTier.tier_name,
      nextTierName: nextTier?.tier_name,
      prevTierName: prevTier?.tier_name,
      progress: result.progress,
      requiredForNext: result.requiredForNext,
      requiredForCurrent: result.requiredForCurrent
    });

    return result;
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