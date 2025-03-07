import { TierEntity, TierProgress } from '../types/tier';
import { parseTokenString } from './tokenUtils';
import { TIER_CONFIG } from '../config/tierConfig';

// Dynamic fee rate from contract
const FEE_RATE = 0.003; // 0.3% fee as per contract

/**
 * Helper function to apply precision based on token decimals
 */
const applyPrecision = (value: number, decimals: number = 8): number => {
  if (decimals <= 0) return Math.round(value);
  const precision = Math.pow(10, decimals);
  return Math.floor(value * precision) / precision;
};

/**
 * Determine the tier a user belongs to based on their staked percentage
 * This is the fundamental function that all other tier calculations should use
 */
export const determineTier = (
  stakedAmount: string,
  totalStaked: string,
  tiers: TierEntity[]
): TierEntity => {
  try {
    // Parse token amounts
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
    
    // Debug
    console.log(`Tier determination: ${staked.amount} ${staked.symbol} is ${stakedPercent.toFixed(6)}% of ${total.amount}`);

    // Sort tiers by percentage threshold (ascending)
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    // Find which tier the user belongs to
    let selectedTier = sortedTiers[0]; // Default to lowest tier
    
    // Iterate through tiers to find the highest tier whose threshold is >= user's percentage
    for (let i = 0; i < sortedTiers.length; i++) {
      const tierThreshold = parseFloat(sortedTiers[i].staked_up_to_percent);
      
      // If we found a threshold that's higher than our percentage,
      // we're in the previous tier (or the first tier if i=0)
      if (stakedPercent <= tierThreshold) {
        if (i === 0) {
          console.log(`User in first tier: ${sortedTiers[0].tier_name} (${stakedPercent.toFixed(2)}% <= ${tierThreshold}%)`);
          return sortedTiers[0];
        } else {
          console.log(`User in tier: ${sortedTiers[i-1].tier_name} (${stakedPercent.toFixed(2)}% <= ${tierThreshold}%)`);
          return sortedTiers[i-1];
        }
      }
      
      // Keep track of current tier as we iterate
      selectedTier = sortedTiers[i];
    }
    
    // If we've gone through all tiers and none exceed our percentage,
    // we're in the highest tier
    console.log(`User in highest tier: ${selectedTier.tier_name} (${stakedPercent.toFixed(2)}% > all thresholds)`);
    return selectedTier;
  } catch (error) {
    console.error('Error determining tier:', error);
    // Default to first tier on error if available
    if (tiers.length > 0) {
      return tiers[0];
    }
    throw new Error('No tier data available');
  }
};

/**
 * Get styling configuration for a tier
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
 * Calculate how much a user can safely unstake without dropping more than one tier level
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

    // Determine the actual tier based on percentage
    // The passed currentTier might not be accurate, so we recalculate
    const actualTier = determineTier(stakedAmount, totalStaked, tiers);
    const actualTierIndex = sortedTiers.findIndex(t => t.tier === actualTier.tier);
    
    // For lowest tier, can unstake almost everything (leave minimum amount)
    if (actualTierIndex === 0) {
      return Math.max(0, stakedValue - 0.00000001); // Leave minimal amount
    }
    
    // Get the threshold of the tier IMMEDIATELY below our actual tier
    // This is the tier we want to avoid dropping below
    const lowerTierIndex = actualTierIndex - 1;
    const lowerTierThreshold = parseFloat(sortedTiers[lowerTierIndex].staked_up_to_percent) / 100;
    
    // Calculate how much we can unstake while staying above the lower tier threshold
    // Formula: (stakedValue - x) / (totalValue - x) = lowerTierThreshold
    // Solved for x: x = (stakedValue - lowerTierThreshold * totalValue) / (1 - lowerTierThreshold)
    const safeAmount = (stakedValue - lowerTierThreshold * totalValue) / (1 - lowerTierThreshold);
    
    // Add a small safety margin to prevent rounding/precision issues (0.5%)
    const safetyMargin = safeAmount * 0.005;
    const finalSafeAmount = Math.max(0, safeAmount - safetyMargin);
    
    // Log detailed information for debugging
    console.log('Safe unstake calculation:', {
      stakedValue: stakedValue.toFixed(8),
      totalValue: totalValue.toFixed(8),
      currentPercent: currentPercent.toFixed(4) + '%',
      assignedTierName: currentTier.tier_name,
      actualTierName: actualTier.tier_name,
      actualTierIndex,
      lowerTierIndex,
      lowerTierThreshold: (lowerTierThreshold * 100).toFixed(4) + '%',
      rawSafeAmount: safeAmount.toFixed(8),
      finalSafeAmount: applyPrecision(finalSafeAmount, decimals).toFixed(8)
    });
    
    // Apply precision and ensure we don't return negative values
    return Math.max(0, applyPrecision(finalSafeAmount, decimals));
  } catch (error) {
    console.error('Error calculating safe unstake amount:', error);
    return 0;
  }
};

/**
 * Calculate tier progress and related metrics
 * This function determines a user's progress toward the next tier
 * and calculates how much more they need to stake to reach it
 */
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

    // Calculate current percentage
    const stakedPercent = (stakedValue / totalValue) * 100;
    
    // Debug
    console.log(`Progress calculation: ${stakedValue.toFixed(8)} ${symbol} is ${stakedPercent.toFixed(6)}% of ${totalValue.toFixed(8)}`);

    // Sort tiers by percentage threshold (ascending)
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    // Determine the current tier using the same function used elsewhere
    // This ensures consistency across all tier-related calculations
    const currentTier = determineTier(stakedAmount, totalStaked, tiers);
    const currentTierIndex = sortedTiers.findIndex(t => t.tier === currentTier.tier);
    
    // Get adjacent tiers
    const nextTier = currentTierIndex < sortedTiers.length - 1 
      ? sortedTiers[currentTierIndex + 1] 
      : undefined;
    const prevTier = currentTierIndex > 0 
      ? sortedTiers[currentTierIndex - 1] 
      : undefined;

    // Get tier thresholds
    const currentTierThreshold = parseFloat(currentTier.staked_up_to_percent);
    const nextTierThreshold = nextTier ? parseFloat(nextTier.staked_up_to_percent) : 100;
    const prevTierThreshold = prevTier ? parseFloat(prevTier.staked_up_to_percent) : 0;

    // Calculate progress toward next tier
    let progress = 0;
    
    if (nextTier) {
      // Calculate progress within the range between current tier and next tier
      const rangeSize = nextTierThreshold - currentTierThreshold;
      
      if (rangeSize > 0) {
        // How far we are between current tier threshold and next tier threshold
        progress = ((stakedPercent - currentTierThreshold) / rangeSize) * 100;
        progress = Math.min(100, Math.max(0, progress)); // Clamp to 0-100 range
      }
      
      console.log(`Progress: ${progress.toFixed(1)}% from ${currentTierThreshold}% to ${nextTierThreshold}%`);
    } else {
      // At max tier
      progress = 100;
    }

    // Calculate amount needed for next tier
    let totalAmountForNext: number | undefined;
    let additionalAmountNeeded: number | undefined;

    if (nextTier) {
      // Calculate the total amount needed to reach the next tier
      // This accounts for how adding tokens affects the percentage calculation
      // Formula: stakedValue / (totalValue + x) = nextTierThreshold/100
      // Solved for x: x = (stakedValue * 100 / nextTierThreshold - totalValue)
      
      const nextTierThresholdDecimal = nextTierThreshold / 100;
      
      // This is the direct way to calculate how much total stake is needed
      // for the next tier threshold
      const targetAmount = nextTierThresholdDecimal * totalValue;
      
      // We need to account for how adding new tokens changes the denominator
      // New formula: (stakedValue + x) / (totalValue + x) = nextTierThresholdDecimal
      // Solved for x: x = (nextTierThresholdDecimal * totalValue - stakedValue) / (1 - nextTierThresholdDecimal)
      
      if (nextTierThresholdDecimal < 1) { // Avoid division by zero
        const additionalAmountRaw = (nextTierThresholdDecimal * totalValue - stakedValue) / (1 - nextTierThresholdDecimal);
        
        // Apply fee adjustment (0.3% fee when staking)
        const additionalWithFee = additionalAmountRaw > 0 
          ? additionalAmountRaw / (1 - FEE_RATE) 
          : 0;
        
        additionalAmountNeeded = applyPrecision(Math.max(0, additionalWithFee), decimals);
        totalAmountForNext = applyPrecision(stakedValue + additionalAmountRaw, decimals);
        
        console.log(`Additional needed: ${additionalAmountNeeded} ${symbol} to reach ${nextTierThreshold}%`);
      } else {
        // Edge case: if nextTierThreshold is 100% or higher
        additionalAmountNeeded = totalValue;
        totalAmountForNext = totalValue;
      }
    }

    // Calculate amount needed to maintain current tier
    // This is important for the safe unstake calculation
    const requiredForCurrent = prevTier 
      ? applyPrecision((prevTierThreshold * totalValue) / 100, decimals)
      : 0;

    // Get tier weight multiplier
    const weight = parseFloat(currentTier.weight);

    // Return comprehensive tier progress information
    return {
      currentTier,
      nextTier,
      prevTier,
      progress,
      requiredForCurrent,
      totalStaked,
      stakedAmount,
      currentStakedAmount: stakedValue,
      symbol,
      totalAmountForNext,
      additionalAmountNeeded,
      weight
    };
  } catch (error) {
    console.error('Error in calculateTierProgress:', error);
    return null;
  }
};

/**
 * Get display name for a tier
 */
export const getTierDisplayName = (tierKey: string): string => {
  return TIER_CONFIG[tierKey.toLowerCase()]?.displayName || tierKey;
};

/**
 * Get weight multiplier for a tier
 */
export const getTierWeight = (tierKey: string): string => {
  return TIER_CONFIG[tierKey.toLowerCase()]?.weight || '1.0';
};

/**
 * Check if a user can upgrade to a higher tier
 * This occurs when their percentage stake would put them in a higher tier
 * than the one they're currently assigned
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
    
    // Determine tier based on actual staked percentage
    const actualTier = determineTier(stakedAmount, totalStaked, tiers);
    
    // If actual tier is higher than current tier, upgrade is available
    const actualTierIndex = sortedTiers.findIndex(t => t.tier === actualTier.tier);
    
    const canUpgrade = actualTierIndex > currentTierIndex;
    console.log(`Tier upgrade available: ${canUpgrade} (current: ${currentTier.tier_name}, actual: ${actualTier.tier_name})`);
    
    return canUpgrade;
  } catch (error) {
    console.error('Error checking tier upgrade availability:', error);
    return false;
  }
};