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

    // Print tiers information for debugging
    sortedTiers.forEach((tier, index) => {
      console.log(`Tier ${index}: ${tier.tier_name} - threshold ${tier.staked_up_to_percent}%`);
    });

    // Find which tier the user belongs to (highest tier where their percentage is below the threshold)
    // We start from highest tier and work our way down
    for (let i = 0; i < sortedTiers.length; i++) {
      const tierThreshold = parseFloat(sortedTiers[i].staked_up_to_percent);
      
      if (stakedPercent <= tierThreshold) {
        // Found a tier where user's percentage doesn't exceed threshold
        if (i === 0) {
          console.log(`User is in first tier: ${sortedTiers[0].tier_name} (${stakedPercent.toFixed(4)}% <= ${tierThreshold}%)`);
          return sortedTiers[0];
        } else {
          // User is in the previous tier (highest tier where percentage exceeds threshold)
          const actualTier = sortedTiers[i - 1];
          console.log(`User is in tier: ${actualTier.tier_name} (${stakedPercent.toFixed(4)}% <= ${tierThreshold}% but > ${parseFloat(actualTier.staked_up_to_percent)}%)`);
          return actualTier;
        }
      }
    }
    
    // If we've gone through all tiers and none exceed our percentage,
    // we're in the highest tier
    const highestTier = sortedTiers[sortedTiers.length - 1];
    console.log(`User is in highest tier: ${highestTier.tier_name} (${stakedPercent.toFixed(4)}% > all thresholds)`);
    return highestTier;
  } catch (error) {
    console.error('Error determining tier:', error);
    // Default to first tier on error if available
    if (tiers.length > 0) {
      const sortedTiers = [...tiers].sort((a, b) => 
        parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
      );
      return sortedTiers[0];
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

    // Find which tier we're actually in (highest tier whose threshold we exceed)
    let actualTierIndex = 0;
    for (let i = 0; i < sortedTiers.length; i++) {
      if (currentPercent <= parseFloat(sortedTiers[i].staked_up_to_percent)) {
        break;
      }
      actualTierIndex = i;
    }
    
    const actualTier = sortedTiers[actualTierIndex];
    
    // Get the next tier down (one tier below current)
    const targetTierIndex = Math.max(0, actualTierIndex - 1);
    const targetTier = sortedTiers[targetTierIndex];
    const targetThreshold = parseFloat(targetTier.staked_up_to_percent) / 100;
    
    // For lowest tier, can unstake almost everything (leave minimum amount)
    if (actualTierIndex === 0) {
      return Math.max(0, stakedValue - 0.00000001); // Leave minimal amount
    }
    
    // Calculate the exact amount that would put us at the target tier threshold
    // Formula: (stakedValue - x) / (totalValue - x) = targetThreshold
    // Solved for x: x = (stakedValue - targetThreshold * totalValue) / (1 - targetThreshold)
    const exactAmount = (stakedValue - targetThreshold * totalValue) / (1 - targetThreshold);
    
    // To ensure we don't drop below the target tier, apply a safety margin
    // Making it 2% ensures we definitely don't drop two tiers
    const safetyFactor = 0.02; // 2% safety margin
    const safeAmount = exactAmount * (1 - safetyFactor);
    
    // Log detailed information for debugging
    console.log('Safe unstake calculation:', {
      stakedValue: stakedValue.toFixed(8),
      totalValue: totalValue.toFixed(8),
      currentPercent: currentPercent.toFixed(4) + '%',
      assignedTierName: currentTier.tier_name,
      actualTierName: actualTier.tier_name,
      targetTierName: targetTier.tier_name,
      actualTierIndex,
      targetTierIndex,
      targetThreshold: (targetThreshold * 100).toFixed(4) + '%',
      exactAmount: exactAmount.toFixed(8),
      safeAmount: applyPrecision(safeAmount, decimals).toFixed(8)
    });
    
    // Apply precision and ensure we don't return negative values
    return Math.max(0, applyPrecision(safeAmount, decimals));
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
    console.log(`Current percentage: ${stakedPercent.toFixed(4)}% (${stakedValue.toFixed(8)} of ${totalValue.toFixed(8)})`);
    
    // Sort tiers by percentage threshold (ascending)
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    // Find which tier the user is actually in right now
    // This is the highest tier where their percentage exceeds the threshold
    let currentTierIndex = -1;
    for (let i = 0; i < sortedTiers.length; i++) {
      const tierThreshold = parseFloat(sortedTiers[i].staked_up_to_percent);
      console.log(`Checking tier ${sortedTiers[i].tier_name} (${tierThreshold}%): ${stakedPercent <= tierThreshold ? 'User below threshold' : 'User exceeds threshold'}`);
      
      if (stakedPercent <= tierThreshold) {
        // Found a tier where user's percentage is below threshold
        // So the previous tier is their current tier
        currentTierIndex = Math.max(0, i - 1);
        break;
      }
    }
    
    // If we went through all tiers and didn't find one with higher threshold,
    // user is in the highest tier
    if (currentTierIndex === -1) {
      currentTierIndex = sortedTiers.length - 1;
      console.log(`User is in highest tier (${sortedTiers[currentTierIndex].tier_name})`);
    }
    
    // Current tier is where we are now
    const currentTier = sortedTiers[currentTierIndex];
    console.log(`Current tier determined as: ${currentTier.tier_name}`);
    
    // Next tier is one ABOVE current (if available)
    const nextTierIndex = currentTierIndex + 1;
    const nextTier = nextTierIndex < sortedTiers.length 
      ? sortedTiers[nextTierIndex] 
      : undefined;
    console.log(`Next tier is: ${nextTier ? nextTier.tier_name : 'None (at highest tier)'}`);
    
    // Previous tier is one BELOW current (if available)
    const prevTier = currentTierIndex > 0 
      ? sortedTiers[currentTierIndex - 1] 
      : undefined;

    // Get tier thresholds (as percentages)
    const currentTierThreshold = parseFloat(currentTier.staked_up_to_percent);
    const nextTierThreshold = nextTier ? parseFloat(nextTier.staked_up_to_percent) : 100;
    
    // Calculate progress toward the NEXT tier
    let progress = 0;
    
    if (nextTier) {
      // Calculate range between current tier threshold and next tier threshold
      const rangeSize = nextTierThreshold - currentTierThreshold;
      
      if (rangeSize > 0) {
        // Calculate how far user has progressed within this range
        progress = ((stakedPercent - currentTierThreshold) / rangeSize) * 100;
        progress = Math.min(100, Math.max(0, progress)); // Clamp to 0-100 range
      }
      
      console.log(`Progress: ${progress.toFixed(1)}% toward ${nextTier.tier_name} (${stakedPercent.toFixed(2)}% between ${currentTierThreshold}% and ${nextTierThreshold}%)`);
    } else {
      // At max tier
      progress = 100;
      console.log(`At max tier (${currentTier.tier_name})`);
    }

    // Calculate amount needed for next tier
    let totalAmountForNext: number | undefined;
    let additionalAmountNeeded: number | undefined;

    if (nextTier) {
      // Calculate how much more is needed to reach next tier
      // Convert next tier threshold to decimal (e.g., 5% -> 0.05)
      const nextTierThresholdDecimal = nextTierThreshold / 100;
      
      // Formula: (stakedValue + x) / (totalValue + x) = nextTierThresholdDecimal
      // Solved for x: x = (nextTierThresholdDecimal * totalValue - stakedValue) / (1 - nextTierThresholdDecimal)
      
      if (nextTierThresholdDecimal < 1) { // Avoid division by zero
        // Raw amount needed (without fee consideration)
        const additionalAmountRaw = (nextTierThresholdDecimal * totalValue - stakedValue) / 
                                    (1 - nextTierThresholdDecimal);
        
        // Apply fee adjustment (0.3% fee when staking) - need to stake more to account for fee
        const additionalWithFee = additionalAmountRaw > 0 
          ? additionalAmountRaw / (1 - FEE_RATE) 
          : 0;
        
        // Ensure we have enough precision and don't allow negative values
        additionalAmountNeeded = applyPrecision(Math.max(0, additionalWithFee), decimals);
        
        // Total amount needed for next tier is current stake plus additional amount
        totalAmountForNext = applyPrecision(stakedValue + additionalAmountRaw, decimals);
        
        console.log(`Need ${additionalAmountNeeded} ${symbol} more to reach ${nextTier.tier_name} (${nextTierThreshold}%)`);
      } else {
        // Edge case: if nextTierThreshold is 100% or higher (practically impossible)
        additionalAmountNeeded = applyPrecision(totalValue, decimals);
        totalAmountForNext = applyPrecision(totalValue, decimals);
      }
    }

    // Get tier weight multiplier for rewards
    const weight = parseFloat(currentTier.weight);

    // Return comprehensive tier progress information
    return {
      currentTier,
      nextTier,
      prevTier,
      progress,
      requiredForCurrent: 0, // Not used for UI display
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