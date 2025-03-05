import { TierEntity, TierProgress } from '../types/tier';
import { parseTokenString } from './tokenUtils';
import { TIER_CONFIG } from '../config/tierConfig';

// Helper function to apply precision based on token's decimals
const applyPrecision = (value: number, stakedAmount: string): number => {
  const { decimals } = parseTokenString(stakedAmount);
  const precision = Math.pow(10, decimals);
  return Math.round(value * precision) / precision;
};

// Determine which tier a user is in based on their staked percentage
export const determineTier = (
  stakedAmount: string,
  totalStaked: string,
  tiers: TierEntity[]
): TierEntity => {
  try {
    const { amount: stakedValue } = parseTokenString(stakedAmount);
    const { amount: totalValue } = parseTokenString(totalStaked);

    // If pool is empty, return lowest tier
    if (totalValue === 0) {
      return tiers[0];
    }

    // Calculate percentage with precise decimal handling
    const stakedPercent = Math.min((stakedValue / totalValue) * 100, 100);

    // Sort tiers by percentage threshold
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    // Find first tier where threshold exceeds staked percentage
    for (const tier of sortedTiers) {
      if (parseFloat(tier.staked_up_to_percent) > stakedPercent) {
        const currentIndex = sortedTiers.indexOf(tier);
        return currentIndex > 0 ? sortedTiers[currentIndex - 1] : sortedTiers[0];
      }
    }

    // If no tier found, use highest tier
    return sortedTiers[sortedTiers.length - 1];
  } catch (error) {
    console.error('Error determining tier:', error);
    return tiers[0];
  }
};

export const getTierConfig = (tier: string) => {
  const config = TIER_CONFIG[tier.toLowerCase()] || TIER_CONFIG.a;
  return config.style
    ? {
        ...config.style,
        icon: config.icon
      }
    : {
        color: 'text-slate-500',
        bgColor: 'bg-slate-500/10',
        borderColor: 'border-slate-500/20',
        progressColor: 'bg-slate-500',
        icon: config.icon
      };
};

// Calculate safe unstake amount that won't drop to a lower tier
export const calculateSafeUnstakeAmount = (
  stakedAmount: string,
  totalStaked: string,
  tiers: TierEntity[],
  currentTier: TierEntity
): number => {
  try {
    const { amount: stakedValue, decimals } = parseTokenString(stakedAmount);
    const { amount: totalValue } = parseTokenString(totalStaked);
    
    if (totalValue === 0) return 0;

    // Sort tiers by percentage threshold
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );
    
    // Find current tier index
    const currentTierIndex = sortedTiers.findIndex(t => t.tier === currentTier.tier);
    
    // If already at lowest tier, can unstake everything
    if (currentTierIndex <= 0) {
      // Round to appropriate decimal places
      return Number(stakedValue.toFixed(decimals));
    }

    // Get the previous tier's threshold
    const prevTier = sortedTiers[currentTierIndex - 1];
    const prevTierThreshold = parseFloat(prevTier.staked_up_to_percent);
    
    // Calculate minimum amount needed to maintain current tier
    // (totalValue * prevTierThreshold / 100) is the absolute minimum needed
    const minRequired = (prevTierThreshold * totalValue) / 100;
    
    // Add a small buffer to prevent edge cases (0.1% buffer)
    const withBuffer = minRequired * 1.001;
    
    // Safe amount is current staked amount minus min required
    const safeAmount = Math.max(0, stakedValue - withBuffer);
    
    // Round to appropriate decimal places based on the token
    return Number(safeAmount.toFixed(decimals));
  } catch (error) {
    console.error('Error calculating safe unstake amount:', error);
    return 0;
  }
};

// Calculate all tier progress and related amounts
export const calculateTierProgress = (
  stakedAmount: string,
  totalStaked: string,
  tiers: TierEntity[]
): TierProgress | null => {
  try {
    const { amount: stakedValue, symbol, decimals } = parseTokenString(stakedAmount);
    const { amount: totalValue } = parseTokenString(totalStaked);
    
    if (isNaN(stakedValue) || isNaN(totalValue) || totalValue === 0) {
      return null;
    }

    // Calculate staked percentage
    const stakedPercent = (stakedValue / totalValue) * 100;

    // Sort tiers by percentage threshold
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    // Find current tier based on staked percentage
    let currentTier = sortedTiers[0]; // Default to lowest tier
    let progress = 0;
    let currentTierIndex = 0;

    // Find the tier where stakedPercent <= tierThreshold
    for (let i = 0; i < sortedTiers.length; i++) {
      const tierThreshold = parseFloat(sortedTiers[i].staked_up_to_percent);
      
      if (stakedPercent <= tierThreshold) {
        currentTier = sortedTiers[i];
        currentTierIndex = i;
        
        // Calculate progress within this tier
        const lowerThreshold = i > 0 ? parseFloat(sortedTiers[i - 1].staked_up_to_percent) : 0;
        const range = tierThreshold - lowerThreshold;
        
        if (range > 0) {
          progress = ((stakedPercent - lowerThreshold) / range) * 100;
          progress = Math.min(100, Math.max(0, progress));
        }
        break;
      }
    }

    // If we didn't find a matching tier, we're at the highest tier
    if (currentTierIndex === 0 && stakedPercent > parseFloat(sortedTiers[0].staked_up_to_percent) && sortedTiers.length > 1) {
      currentTier = sortedTiers[sortedTiers.length - 1];
      currentTierIndex = sortedTiers.length - 1;
      progress = 100;
    }

    // Get adjacent tiers
    const nextTier = currentTierIndex < sortedTiers.length - 1 
      ? sortedTiers[currentTierIndex + 1] 
      : undefined;
    const prevTier = currentTierIndex > 0 
      ? sortedTiers[currentTierIndex - 1] 
      : undefined;

    // Calculate amounts needed for next tier
    let totalAmountForNext: number | undefined;
    let additionalAmountNeeded: number | undefined;

    if (nextTier) {
      const nextTierThreshold = parseFloat(nextTier.staked_up_to_percent);
      const targetAmount = (nextTierThreshold * totalValue) / 100;
      
      if (targetAmount > stakedValue) {
        totalAmountForNext = Number(targetAmount.toFixed(decimals));
        additionalAmountNeeded = Number((targetAmount - stakedValue).toFixed(decimals));
      } else {
        totalAmountForNext = Number(targetAmount.toFixed(decimals));
        additionalAmountNeeded = 0;
      }
    }

    // Calculate required amount for current tier
    const currentTierThreshold = parseFloat(currentTier.staked_up_to_percent);
    const requiredForCurrent = Number((currentTierThreshold * totalValue / 100).toFixed(decimals));

    return {
      currentTier,
      nextTier,
      prevTier,
      progress: Math.min(Math.max(0, progress), 100),
      requiredForCurrent,
      totalStaked,
      stakedAmount,
      currentStakedAmount: stakedValue,
      symbol,
      totalAmountForNext,
      additionalAmountNeeded,
      weight: parseFloat(currentTier.weight)
    };
  } catch (error) {
    console.error('Error in calculateTierProgress:', error);
    return null;
  }
};

export const getTierDisplayName = (tierKey: string): string => {
  return TIER_CONFIG[tierKey.toLowerCase()]?.displayName || tierKey;
};

export const getTierWeight = (tierKey: string): string => {
  return TIER_CONFIG[tierKey.toLowerCase()]?.weight || '1.0';
};

// Check if tier upgrade is available
export const isTierUpgradeAvailable = (
  stakedAmount: string,
  totalStaked: string,
  currentTier: TierEntity,
  tiers: TierEntity[]
): boolean => {
  try {
    const { amount: stakedValue } = parseTokenString(stakedAmount);
    const { amount: totalValue } = parseTokenString(totalStaked);
    
    if (totalValue === 0) return false;

    // Calculate staked percentage
    const stakedPercent = (stakedValue / totalValue) * 100;
    
    // Get the next tier (if any)
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );
    
    const currentTierIndex = sortedTiers.findIndex(t => t.tier === currentTier.tier);
    
    // If already at max tier, no upgrade available
    if (currentTierIndex >= sortedTiers.length - 1) {
      return false;
    }
    
    const nextTier = sortedTiers[currentTierIndex + 1];
    const nextTierThreshold = parseFloat(nextTier.staked_up_to_percent);
    
    // If we exceed next tier's threshold, an upgrade is available
    return stakedPercent >= nextTierThreshold;
  } catch (error) {
    console.error('Error checking tier upgrade availability:', error);
    return false;
  }
};
