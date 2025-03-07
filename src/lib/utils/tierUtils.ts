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
    const { amount: stakedValue } = parseTokenString(stakedAmount);
    const { amount: totalValue } = parseTokenString(totalStaked);

    // Handle edge cases
    if (totalValue === 0 || stakedValue === 0) {
      const sortedTiers = [...tiers].sort((a, b) => 
        parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
      );
      return sortedTiers[0];
    }

    // Calculate user's stake percentage
    const stakedPercent = (stakedValue / totalValue) * 100;
    
    // Debug logs
    console.log(`Tier calculation: ${stakedValue.toFixed(8)} is ${stakedPercent.toFixed(4)}% of ${totalValue.toFixed(8)}`);

    // Sort tiers by threshold (ascending)
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    // Find the highest tier where user's percentage doesn't exceed threshold
    for (let i = 0; i < sortedTiers.length; i++) {
      const tierThreshold = parseFloat(sortedTiers[i].staked_up_to_percent);
      
      if (stakedPercent <= tierThreshold) {
        // If this is the first tier, user is in it
        if (i === 0) {
          console.log(`User in first tier: ${sortedTiers[0].tier_name} (${stakedPercent.toFixed(4)}% <= ${tierThreshold}%)`);
          return sortedTiers[0];
        } else {
          // Otherwise, user is in the previous tier
          console.log(`User in tier: ${sortedTiers[i-1].tier_name} (${stakedPercent.toFixed(4)}% <= ${tierThreshold}%)`);
          return sortedTiers[i-1];
        }
      }
    }
    
    // If user's percentage exceeds all thresholds, return highest tier
    const highestTier = sortedTiers[sortedTiers.length - 1];
    console.log(`User in highest tier: ${highestTier.tier_name} (${stakedPercent.toFixed(4)}% > all thresholds)`);
    return highestTier;
  } catch (error) {
    console.error('Error determining tier:', error);
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
    const stakedPercent = (stakedValue / totalValue) * 100;
    console.log(`Safe unstake calc: ${stakedValue.toFixed(8)} is ${stakedPercent.toFixed(4)}% of ${totalValue.toFixed(8)}`);

    // Sort tiers by percentage threshold (ascending)
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    // Find current tier index (based on percentage, not passed currentTier)
    let currentTierIndex = -1;
    for (let i = 0; i < sortedTiers.length; i++) {
      const tierThreshold = parseFloat(sortedTiers[i].staked_up_to_percent);
      
      if (stakedPercent <= tierThreshold) {
        currentTierIndex = i > 0 ? i - 1 : 0;
        break;
      }
    }
    
    // If we didn't find a threshold higher than user's percentage, use highest tier
    if (currentTierIndex === -1) {
      currentTierIndex = sortedTiers.length - 1;
    }
    
    // Get the actual tier based on percentage
    const actualTier = sortedTiers[currentTierIndex];
    console.log(`Actual tier for safe unstake: ${actualTier.tier_name}`);
    
    // For lowest tier, can unstake almost everything
    if (currentTierIndex === 0) {
      return Math.max(0, stakedValue - 0.00000001);
    }
    
    // Get the previous tier's threshold (one tier down)
    const prevTierIndex = currentTierIndex - 1;
    const prevTier = sortedTiers[prevTierIndex];
    const prevTierThreshold = parseFloat(prevTier.staked_up_to_percent) / 100;
    
    // Calculate maximum unstake amount to stay above previous tier's threshold
    // Using the formula: (stakedValue - x) / (totalValue - x) = prevTierThreshold
    // Solved for x: x = (stakedValue - prevTierThreshold * totalValue) / (1 - prevTierThreshold)
    const safeUnstakeAmount = (stakedValue - prevTierThreshold * totalValue) / (1 - prevTierThreshold);
    
    // Apply a safety margin to prevent edge cases (5%)
    const safetyFactor = 0.05; // 5% safety margin 
    const finalSafeAmount = safeUnstakeAmount * (1 - safetyFactor);
    
    console.log(`Safe unstake calculation:`, {
      currentTier: currentTier.tier_name,
      actualTier: actualTier.tier_name,
      prevTier: prevTier.tier_name,
      currentStake: stakedValue.toFixed(8),
      prevTierThreshold: (prevTierThreshold * 100).toFixed(4) + '%',
      rawSafeAmount: safeUnstakeAmount.toFixed(8),
      safeAmountWithMargin: finalSafeAmount.toFixed(8)
    });
    
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
    console.log(`Progress calc: ${stakedValue.toFixed(8)} is ${stakedPercent.toFixed(4)}% of ${totalValue.toFixed(8)}`);
    
    // Sort tiers by percentage threshold (ascending)
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    // Find current tier (highest tier where user's percentage doesn't exceed threshold)
    let currentTierIndex = -1;
    
    for (let i = 0; i < sortedTiers.length; i++) {
      const tierThreshold = parseFloat(sortedTiers[i].staked_up_to_percent);
      
      if (stakedPercent <= tierThreshold) {
        // Found a tier where user's percentage doesn't exceed threshold
        currentTierIndex = i > 0 ? i - 1 : 0;
        break;
      }
    }
    
    // If we went through all tiers and didn't find one with higher threshold,
    // user is in the highest tier
    if (currentTierIndex === -1) {
      currentTierIndex = sortedTiers.length - 1;
    }
    
    // Current tier is where we are now
    const currentTier = sortedTiers[currentTierIndex];
    console.log(`Current tier: ${currentTier.tier_name} (${currentTier.weight}x)`);
    
    // Next tier is one higher (if available)
    const nextTierIndex = currentTierIndex + 1;
    const nextTier = nextTierIndex < sortedTiers.length 
      ? sortedTiers[nextTierIndex] 
      : undefined;
    console.log(`Next tier: ${nextTier ? nextTier.tier_name : 'None (at highest tier)'}`);
    
    // Previous tier is one lower (if available)
    const prevTierIndex = currentTierIndex - 1;
    const prevTier = prevTierIndex >= 0 
      ? sortedTiers[prevTierIndex] 
      : undefined;

    // Get tier thresholds (as percentages)
    const currentTierThreshold = parseFloat(currentTier.staked_up_to_percent);
    const nextTierThreshold = nextTier ? parseFloat(nextTier.staked_up_to_percent) : 100;
    
    // Calculate progress toward next tier
    let progress = 0;
    
    if (nextTier) {
      // Calculate range between current tier threshold and next tier threshold
      const rangeSize = nextTierThreshold - currentTierThreshold;
      
      if (rangeSize > 0) {
        progress = ((stakedPercent - currentTierThreshold) / rangeSize) * 100;
        progress = Math.min(100, Math.max(0, progress)); // Clamp to 0-100 range
      }
      
      console.log(`Progress: ${progress.toFixed(1)}% to ${nextTier.tier_name} (${stakedPercent.toFixed(4)}% between ${currentTierThreshold}% and ${nextTierThreshold}%)`);
    } else {
      // At max tier
      progress = 100;
      console.log(`At max tier (${currentTier.tier_name})`);
    }

    // Calculate amount needed for next tier
    let totalAmountForNext: number | undefined;
    let additionalAmountNeeded: number | undefined;

    if (nextTier) {
      // Convert next tier threshold to decimal (e.g., 5% -> 0.05)
      const nextTierThresholdDecimal = nextTierThreshold / 100;
      
      if (nextTierThresholdDecimal < 1) { // Avoid division by zero
        // Calculate additional amount needed using the formula:
        // (stakedValue + x) / (totalValue + x) = nextTierThresholdDecimal
        // Solved for x: x = (nextTierThresholdDecimal * totalValue - stakedValue) / (1 - nextTierThresholdDecimal)
        const additionalRaw = (nextTierThresholdDecimal * totalValue - stakedValue) / (1 - nextTierThresholdDecimal);
        
        // Apply fee adjustment (0.3% fee when staking)
        const additionalWithFee = additionalRaw > 0 
          ? additionalRaw / (1 - FEE_RATE) 
          : 0;
        
        additionalAmountNeeded = applyPrecision(Math.max(0, additionalWithFee), decimals);
        totalAmountForNext = applyPrecision(stakedValue + additionalRaw, decimals);
        
        console.log(`Need ${additionalAmountNeeded} ${symbol} more to reach ${nextTier.tier_name} (${nextTierThreshold}%)`);
        console.log(`Total needed: ${totalAmountForNext} ${symbol}`);
      } else {
        // Edge case: if nextTierThreshold is 100%
        additionalAmountNeeded = applyPrecision(totalValue, decimals);
        totalAmountForNext = applyPrecision(totalValue, decimals);
      }
    }

    // Calculate required amount for current tier (minimum to stay in current tier)
    const prevTierThreshold = prevTier ? parseFloat(prevTier.staked_up_to_percent) / 100 : 0;
    const requiredForCurrent = applyPrecision(prevTierThreshold * totalValue, decimals);

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
      weight: parseFloat(currentTier.weight)
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