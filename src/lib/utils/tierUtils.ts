import { TierEntity, TierProgress } from '../types/tier';
import { StakedEntity } from '../types/staked';
import { PoolEntity } from '../types/pool';
import { parseTokenString } from './tokenUtils';

// tierUtils.ts

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
    console.log('Calculated staked percent:', stakedPercent);

    // Sort tiers by staked_up_to_percent
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    // Find current tier
    let currentTier = sortedTiers[0];
    let nextTier: TierEntity | undefined;
    let prevTier: TierEntity | undefined;

    for (let i = 0; i < sortedTiers.length; i++) {
      const tierThreshold = parseFloat(sortedTiers[i].staked_up_to_percent);
      if (stakedPercent <= tierThreshold) {
        currentTier = sortedTiers[i];
        nextTier = sortedTiers[i + 1];
        prevTier = sortedTiers[i - 1];
        break;
      }
    }

    // Calculate progress
    const currentThreshold = parseFloat(currentTier.staked_up_to_percent);
    const prevThreshold = prevTier ? parseFloat(prevTier.staked_up_to_percent) : 0;
    
    const progress = prevTier
      ? ((stakedPercent - prevThreshold) / (currentThreshold - prevThreshold)) * 100
      : (stakedPercent / currentThreshold) * 100;

    const result = {
      currentTier,
      nextTier,
      prevTier,
      progress: Math.min(progress, 100),
      requiredForNext: nextTier ? parseFloat(nextTier.staked_up_to_percent) : undefined,
      requiredForCurrent: parseFloat(currentTier.staked_up_to_percent)
    };

    console.log('Calculated tier progress result:', result);
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
    
    const nextTier = tiers.find(t => 
      parseFloat(t.staked_up_to_percent) > parseFloat(currentTier.staked_up_to_percent)
    );
    
    return !!nextTier && stakedPercent >= parseFloat(currentTier.staked_up_to_percent);
  } catch (error) {
    console.error('Error in isTierUpgradeAvailable:', error);
    return false;
  }
};