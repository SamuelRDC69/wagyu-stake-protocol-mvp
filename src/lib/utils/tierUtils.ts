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
  return Math.floor(value * precision) / precision;
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

    // Find the highest tier whose threshold is greater than or equal to the staked percentage
    for (let i = 0; i < sortedTiers.length; i++) {
      const threshold = parseFloat(sortedTiers[i].staked_up_to_percent);
      
      if (stakedPercent <= threshold) {
        // Found a tier where the threshold is >= our percentage
        // But we want the previous tier (the highest one we qualify for)
        if (i === 0) {
          console.log(`Using first tier: ${sortedTiers[0].tier_name} - below first threshold`);
          return sortedTiers[0];
        } else {
          console.log(`Selected tier: ${sortedTiers[i-1].tier_name} - highest below user's ${stakedPercent.toFixed(2)}%`);
          return sortedTiers[i-1];
        }
      }
    }
    
    // If we've gone through all tiers and none exceed our percentage,
    // return the highest tier
    const highestTier = sortedTiers[sortedTiers.length - 1];
    console.log(`Selected highest tier: ${highestTier.tier_name} - no higher thresholds`);
    return highestTier;
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
 * Calculate how much a user can safely unstake without dropping more than one tier
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

    // Calculate current percentage in the pool
    const currentPercent = (stakedValue / totalValue) * 100;

    // Sort tiers by percentage threshold (ascending)
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );
    
    // First, determine the tier the user is ACTUALLY in based on percentage
    // This ensures we're working with the correct tier regardless of what was passed
    let actualTierIndex = sortedTiers.length - 1; // Default to highest tier
    for (let i = 0; i < sortedTiers.length; i++) {
      const tierThreshold = parseFloat(sortedTiers[i].staked_up_to_percent);
      if (currentPercent <= tierThreshold) {
        actualTierIndex = i > 0 ? i - 1 : 0;
        break;
      }
    }
    
    const actualTier = sortedTiers[actualTierIndex];
    
    // For lowest tier, can unstake most everything (leave minimum stake)
    if (actualTierIndex === 0) {
      return Math.max(0, stakedValue - 0.00000001); // Leave minimal amount
    }
    
    // Get the threshold of the tier IMMEDIATELY below our actual tier
    // This is the tier we want to avoid dropping below
    const lowerTierIndex = Math.max(0, actualTierIndex - 1);
    const lowerTierThreshold = parseFloat(sortedTiers[lowerTierIndex].staked_up_to_percent) / 100;
    
    // Calculate how much we can unstake while staying above the lower tier threshold
    // Formula: (stakedValue - x) / (totalValue - x) = lowerTierThreshold
    // Solved for x: x = (stakedValue - lowerTierThreshold * totalValue) / (1 - lowerTierThreshold)
    const safeAmount = (stakedValue - lowerTierThreshold * totalValue) / (1 - lowerTierThreshold);
    
    // Add a small safety margin to prevent rounding issues
    const safetyMargin = safeAmount * 0.005; // 0.5% safety margin
    const finalSafeAmount = Math.max(0, safeAmount - safetyMargin);
    
    // Log detailed information for debugging
    console.log('Safe unstake calculation:', {
      stakedValue,
      totalValue,
      currentPercent: currentPercent.toFixed(4) + '%',
      passedTier: currentTier.tier_name,
      actualTier: actualTier.tier_name,
      actualTierIndex,
      lowerTierIndex,
      lowerTierThreshold: (lowerTierThreshold * 100).toFixed(4) + '%',
      safeAmount,
      finalSafeAmount: applyPrecision(finalSafeAmount, decimals)
    });
    
    // Apply precision and ensure we don't return negative values
    return Math.max(0, applyPrecision(finalSafeAmount, decimals));
  } catch (error) {
    console.error('Error calculating safe unstake amount:', error);
    return 0;
  }
};

/**
 * Calculate tier progress and related metrics with consistent mathematical approach
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

    // Calculate staked percentage precisely
    const stakedPercent = (staked.amount / total.amount) * 100;
    
    // Sort tiers by percentage threshold
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    // Determine the actual tier based on the percentage
    // Find the highest tier the user qualifies for
    let currentTierIndex = sortedTiers.length - 1; // Default to highest tier
    for (let i = 0; i < sortedTiers.length; i++) {
      const threshold = parseFloat(sortedTiers[i].staked_up_to_percent);
      if (stakedPercent <= threshold) {
        currentTierIndex = i > 0 ? i - 1 : 0;
        break;
      }
    }
    
    const currentTier = sortedTiers[currentTierIndex];
    
    // Get adjacent tiers
    const nextTier = currentTierIndex < sortedTiers.length - 1 
      ? sortedTiers[currentTierIndex + 1] 
      : undefined;
    const prevTier = currentTierIndex > 0 
      ? sortedTiers[currentTierIndex - 1] 
      : undefined;

    // Calculate progress towards the next tier
    // This is key for consistent display
    let progress = 0;
    if (nextTier) {
      const currentThreshold = parseFloat(currentTier.staked_up_to_percent);
      const nextThreshold = parseFloat(nextTier.staked_up_to_percent);
      
      if (nextThreshold > currentThreshold) {
        progress = ((stakedPercent - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
      }
    } else {
      // At max tier
      progress = 100;
    }
    
    // Ensure progress is between 0 and 100
    progress = Math.min(100, Math.max(0, progress));

    // Calculate amounts for next tier using the correct formula
    let totalAmountForNext: number | undefined;
    let additionalAmountNeeded: number | undefined;

    if (nextTier) {
      const nextTierThreshold = parseFloat(nextTier.staked_up_to_percent) / 100;
      
      // Calculate the amount needed for next tier using the same formula as the contract
      // Formula: stakedAmount / (totalAmount - additionalAmount) = nextTierThreshold
      // Solved for additionalAmount: additionalAmount = (nextTierThreshold * totalAmount - stakedAmount) / (1 - nextTierThreshold)
      const amountNeededRaw = (nextTierThreshold * total.amount - staked.amount) / (1 - nextTierThreshold);
      
      // Apply fee adjustment
      if (amountNeededRaw > 0) {
        // Account for fee when staking
        const rawWithFee = amountNeededRaw / (1 - FEE_RATE);
        additionalAmountNeeded = applyPrecision(Math.max(0, rawWithFee), staked.decimals);
        totalAmountForNext = applyPrecision(staked.amount + amountNeededRaw, staked.decimals);
      } else {
        // Already at or above next tier
        additionalAmountNeeded = 0;
        totalAmountForNext = staked.amount;
      }
    }

    // Calculate required amount for current tier
    const prevTierThreshold = prevTier ? parseFloat(prevTier.staked_up_to_percent) / 100 : 0;
    const requiredForCurrent = applyPrecision((prevTierThreshold * total.amount) / (1 - prevTierThreshold), staked.decimals);

    // Calculate weight multiplier
    const weight = parseFloat(currentTier.weight);

    // Log calculation details for debugging
    console.log('Tier progress calculation:', {
      stakedAmount: staked.amount,
      totalStaked: total.amount,
      stakedPercent: stakedPercent.toFixed(4) + '%',
      currentTier: currentTier.tier_name,
      nextTier: nextTier?.tier_name || 'None',
      progress: progress.toFixed(2) + '%',
      additionalAmountNeeded,
      totalAmountForNext
    });

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
    // Parse token amounts
    const staked = parseTokenString(stakedAmount);
    const total = parseTokenString(totalStaked);
    
    if (total.amount === 0 || staked.amount === 0) return false;
    
    // Calculate current percentage
    const stakedPercent = (staked.amount / total.amount) * 100;
    
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
    
    // Get next tier threshold
    const nextTier = sortedTiers[currentTierIndex + 1];
    const nextTierThreshold = parseFloat(nextTier.staked_up_to_percent);
    
    // Check if current percentage meets or exceeds next tier threshold
    return stakedPercent > nextTierThreshold;
  } catch (error) {
    console.error('Error checking tier upgrade availability:', error);
    return false;
  }
};