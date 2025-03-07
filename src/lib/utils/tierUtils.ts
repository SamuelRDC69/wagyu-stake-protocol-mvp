import { TierEntity, TierProgress } from '../types/tier';
import { parseTokenString } from './tokenUtils';
import { TIER_CONFIG } from '../config/tierConfig';

// Dynamic fee rate from contract
const FEE_RATE = 0.003; // 0.3% fee as per contract

/**
 * Helper function to apply precision based on token decimals
 */
const applyPrecision = (value: number, decimals: number): number => {
  if (decimals <= 0) return Math.round(value);
  const precision = Math.pow(10, decimals);
  return Math.round(value * precision) / precision;
};

/**
 * Determine which tier a user is in based on their staked percentage
 */
export const determineTier = (
  stakedAmount: string,
  totalStaked: string,
  tiers: TierEntity[]
): TierEntity => {
  try {
    // Parse token amounts dynamically
    const staked = parseTokenString(stakedAmount);
    const total = parseTokenString(totalStaked);

    // Handle edge cases
    if (total.amount === 0 || staked.amount === 0) {
      // If pool is empty or user has no stake, return lowest tier
      const sortedTiers = [...tiers].sort((a, b) => 
        parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
      );
      return sortedTiers[0];
    }

    // Calculate percentage of pool
    const stakedPercent = (staked.amount / total.amount) * 100;
    console.log(`Tier calculation: ${staked.amount} ${staked.symbol} is ${stakedPercent.toFixed(6)}% of ${total.amount}`);

    // Sort tiers by percentage threshold
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    // Debug logging
    console.log(`Sorted tiers (${sortedTiers.length}):`);
    sortedTiers.forEach((t, i) => {
      console.log(`  ${i}: ${t.tier} (${t.tier_name}) - ${t.staked_up_to_percent}%`);
    });

    // Start with the lowest tier
    let selectedTier = sortedTiers[0];
    
    // Find the highest tier whose threshold is less than or equal to the staked percentage
    for (let i = 0; i < sortedTiers.length; i++) {
      const threshold = parseFloat(sortedTiers[i].staked_up_to_percent);
      
      // If we found a threshold that's higher than our percentage,
      // return the previous tier (or the first tier if i=0)
      if (stakedPercent < threshold) {
        if (i === 0) {
          console.log(`Using first tier: ${sortedTiers[0].tier_name} - below first threshold`);
          return sortedTiers[0];
        } else {
          console.log(`Selected tier: ${sortedTiers[i-1].tier_name} - highest below user's ${stakedPercent.toFixed(2)}%`);
          return sortedTiers[i-1];
        }
      }
      
      // Keep track of the current highest valid tier
      selectedTier = sortedTiers[i];
    }
    
    // If we've gone through all tiers and none exceed our percentage,
    // return the highest tier
    console.log(`Selected highest tier: ${selectedTier.tier_name} - no higher thresholds`);
    return selectedTier;
  } catch (error) {
    console.error('Error determining tier:', error);
    if (tiers.length > 0) {
      return tiers[0]; // Default to first tier on error
    }
    throw new Error('No tier data available');
  }
};

/**
 * Get the styling configuration for a tier
 */
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

/**
 * Calculate how much a user can safely unstake without dropping to a lower tier
 */
export const calculateSafeUnstakeAmount = (
  stakedAmount: string,
  totalStaked: string,
  tiers: TierEntity[],
  currentTier: TierEntity
): number => {
  try {
    const { amount: stakedValue, decimals } = parseTokenString(stakedAmount);
    const { amount: totalValue } = parseTokenString(totalStaked);
    
    if (totalValue === 0 || stakedValue === 0) return 0;

    // Sort tiers by percentage threshold
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    // Find current tier index
    const currentTierIndex = sortedTiers.findIndex(t => t.tier === currentTier.tier);
    
    // For lowest tier, can unstake everything
    if (currentTierIndex <= 0) return stakedValue;

    // Get previous tier threshold
    const prevTierThreshold = parseFloat(sortedTiers[currentTierIndex - 1].staked_up_to_percent) / 100;
    
    // The formula needs to solve for maximum unstake amount (x) where:
    // (stakedValue - x) / (totalValue - x) >= prevTierThreshold
    // Algebra: (stakedValue - x) >= prevTierThreshold * (totalValue - x)
    // stakedValue - x >= prevTierThreshold * totalValue - prevTierThreshold * x
    // stakedValue - x >= prevTierThreshold * totalValue - prevTierThreshold * x
    // stakedValue - prevTierThreshold * totalValue >= x - prevTierThreshold * x
    // stakedValue - prevTierThreshold * totalValue >= x * (1 - prevTierThreshold)
    // (stakedValue - prevTierThreshold * totalValue) / (1 - prevTierThreshold) >= x
    
    const safeAmount = (stakedValue - prevTierThreshold * totalValue) / (1 - prevTierThreshold);
    
    return Math.max(0, Math.floor(safeAmount * Math.pow(10, decimals)) / Math.pow(10, decimals));
  } catch (error) {
    console.error('Error calculating safe unstake amount:', error);
    return 0;
  }
};

/**
 * Calculate tier progress and related metrics
 */
export const calculateTierProgress = (
  stakedAmount: string,
  totalStaked: string,
  tiers: TierEntity[]
): TierProgress | null => {
  try {
    const staked = parseTokenString(stakedAmount);
    const total = parseTokenString(totalStaked);
    
    if (isNaN(staked.amount) || isNaN(total.amount) || total.amount === 0) {
      return null;
    }

    // Calculate staked percentage
    const stakedPercent = (staked.amount / total.amount) * 100;
    console.log(`Progress calculation: ${staked.amount} ${staked.symbol} is ${stakedPercent.toFixed(6)}% of ${total.amount}`);

    // Sort tiers by percentage threshold
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    // Get current tier
    const currentTier = determineTier(stakedAmount, totalStaked, tiers);
    const currentTierIndex = sortedTiers.findIndex(t => t.tier === currentTier.tier);
    
    // Get adjacent tiers
    const nextTier = currentTierIndex < sortedTiers.length - 1 
      ? sortedTiers[currentTierIndex + 1] 
      : undefined;
    const prevTier = currentTierIndex > 0 
      ? sortedTiers[currentTierIndex - 1] 
      : undefined;

    // Calculate progress
    let progress = 0;
    
    if (nextTier) {
      const currentThreshold = parseFloat(currentTier.staked_up_to_percent);
      const nextThreshold = parseFloat(nextTier.staked_up_to_percent);
      const prevThreshold = prevTier ? parseFloat(prevTier.staked_up_to_percent) : 0;
      
      if (stakedPercent < currentThreshold) {
        // We're somewhere between prev and current tier
        const rangeSize = currentThreshold - prevThreshold;
        progress = rangeSize > 0 
          ? ((stakedPercent - prevThreshold) / rangeSize) * 100 
          : 0;
      } else {
        // We're somewhere between current and next tier
        const rangeSize = nextThreshold - currentThreshold;
        progress = rangeSize > 0 
          ? ((stakedPercent - currentThreshold) / rangeSize) * 100 
          : 0;
      }
      
      console.log(`Progress calculation: ${progress.toFixed(2)}% towards next tier`);
    } else {
      // At max tier
      progress = 100;
    }
    
    // Ensure progress is between 0 and 100
    progress = Math.min(100, Math.max(0, progress));

    // Calculate amounts for next tier
    let totalAmountForNext: number | undefined;
    let additionalAmountNeeded: number | undefined;

    if (nextTier) {
      const nextTierThreshold = parseFloat(nextTier.staked_up_to_percent);
      const requiredPercent = nextTierThreshold;
      
      // Calculate absolute amount needed for next tier
      totalAmountForNext = applyPrecision((requiredPercent * total.amount) / 100, staked.decimals);
      
      // Calculate additional amount needed
      if (totalAmountForNext > staked.amount) {
        // Account for fee when staking
        const rawAmountNeeded = (totalAmountForNext - staked.amount) / (1 - FEE_RATE);
        additionalAmountNeeded = applyPrecision(rawAmountNeeded, staked.decimals);
      } else {
        additionalAmountNeeded = 0;
      }
    }

    // Calculate required amount for current tier
    const currentTierThreshold = parseFloat(currentTier.staked_up_to_percent);
    const requiredForCurrent = applyPrecision((currentTierThreshold * total.amount) / 100, staked.decimals);

    // Calculate weight multiplier
    const weight = parseFloat(currentTier.weight);

    return {
      currentTier,
      nextTier,
      prevTier,
      progress,
      requiredForCurrent,
      totalStaked,
      stakedAmount,
      currentStakedAmount: staked.amount,
      symbol: staked.symbol,
      totalAmountForNext,
      additionalAmountNeeded,
      weight
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

/**
 * Check if user can upgrade to a higher tier
 */
export const isTierUpgradeAvailable = (
  stakedAmount: string,
  totalStaked: string,
  currentTier: TierEntity,
  tiers: TierEntity[]
): boolean => {
  try {
    // Sort tiers by percentage threshold
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );
    
    // Find current tier index
    const currentTierIndex = sortedTiers.findIndex(t => t.tier === currentTier.tier);
    
    // If already at max tier, cannot upgrade
    if (currentTierIndex >= sortedTiers.length - 1) {
      return false;
    }
    
    // Determine tier based on actual staked amount
    const actualTier = determineTier(stakedAmount, totalStaked, tiers);
    
    // If actual tier is higher than current tier, upgrade is available
    const actualTierIndex = sortedTiers.findIndex(t => t.tier === actualTier.tier);
    return actualTierIndex > currentTierIndex;
  } catch (error) {
    console.error('Error checking tier upgrade availability:', error);
    return false;
  }
};