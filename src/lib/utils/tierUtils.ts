import { TierEntity, TierProgress } from '../types/tier';
import { parseTokenString } from './tokenUtils';
import { TIER_CONFIG } from '../config/tierConfig';

const FEE_RATE = 0.003; // 0.3% fee as per contract
const PRECISION = 100000000; // 8 decimal places for WAX

// Helper function to apply WAX precision
const applyWaxPrecision = (value: number): number => {
  return Math.round(value * PRECISION) / PRECISION;
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

    // Start with lowest tier
    let currentTier = sortedTiers[0];

    // Loop through tiers to find the right tier for this percentage
    for (let i = 0; i < sortedTiers.length; i++) {
      const tierThreshold = parseFloat(sortedTiers[i].staked_up_to_percent);
      if (stakedPercent <= tierThreshold) {
        currentTier = sortedTiers[i];
        break;
      }
    }

    return currentTier;
  } catch (error) {
    console.error('Error determining tier:', error);
    return tiers[0];
  }
};

// Calculate safe unstake amount that won't drop to a lower tier
export const calculateSafeUnstakeAmount = (
  stakedAmount: string,
  totalStaked: string,
  tiers: TierEntity[],
  currentTier: TierEntity
): number => {
  try {
    const { amount: stakedValue } = parseTokenString(stakedAmount);
    const { amount: totalValue } = parseTokenString(totalStaked);
    
    if (totalValue === 0) return 0;

    // Sort tiers by percentage threshold
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    // Find current tier index
    const currentTierIndex = sortedTiers.findIndex(t => t.tier === currentTier.tier);
    
    // For lowest tier, can unstake everything
    if (currentTierIndex <= 0) {
      return applyWaxPrecision(stakedValue);
    }

    // Get the previous tier's threshold - need to stay above this to maintain current tier
    const prevTierThreshold = parseFloat(sortedTiers[currentTierIndex - 1].staked_up_to_percent);
    
    // Calculate what the pool will be after unstaking
    // x = amount to unstake
    // (stakedValue - x) / (totalValue - x) > prevTierThreshold/100
    // (stakedValue - x) > (prevTierThreshold/100) * (totalValue - x)
    // stakedValue - x > (prevTierThreshold/100 * totalValue) - (prevTierThreshold/100 * x)
    // stakedValue - (prevTierThreshold/100 * totalValue) > x * (1 - prevTierThreshold/100)
    // x = (stakedValue - (prevTierThreshold/100 * totalValue)) / (1 - prevTierThreshold/100)
    
    const targetAmount = (prevTierThreshold/100 * totalValue);
    const denominator = (1 - prevTierThreshold/100);
    
    if (denominator === 0) return 0;
    
    const safeAmount = (stakedValue - targetAmount) / denominator;
    return applyWaxPrecision(Math.max(0, safeAmount));
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
    const { amount: stakedValue, symbol } = parseTokenString(stakedAmount);
    const { amount: totalValue } = parseTokenString(totalStaked);
    
    if (isNaN(stakedValue) || isNaN(totalValue) || totalValue === 0) {
      return null;
    }

    // Calculate staked percentage
    const stakedPercent = Math.min((stakedValue / totalValue) * 100, 100);

    // Get current tier and adjacent tiers
    const currentTier = determineTier(stakedAmount, totalStaked, tiers);
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );
    const currentTierIndex = sortedTiers.findIndex(t => t.tier === currentTier.tier);
    const nextTier = currentTierIndex < sortedTiers.length - 1 
      ? sortedTiers[currentTierIndex + 1] 
      : undefined;
    const prevTier = currentTierIndex > 0 
      ? sortedTiers[currentTierIndex - 1] 
      : undefined;

    // Calculate progress percentage
    let progress = 0;
    if (nextTier) {
      // Find which threshold we're working between
      const prevThreshold = currentTierIndex > 0 
        ? parseFloat(sortedTiers[currentTierIndex - 1].staked_up_to_percent) 
        : 0;
      const currentThreshold = parseFloat(currentTier.staked_up_to_percent);
      
      // Calculate progress within current tier's range
      const range = currentThreshold - prevThreshold;
      if (range > 0) {
        progress = ((stakedPercent - prevThreshold) / range) * 100;
      }
    } else {
      progress = 100; // Max tier
    }

    // Calculate amounts for next tier
    let totalAmountForNext: number | undefined;
    let additionalAmountNeeded: number | undefined;

    if (nextTier) {
      const currentThreshold = parseFloat(currentTier.staked_up_to_percent);
      const targetPercentage = currentThreshold + 0.00001; // Just slightly over threshold
      
      // Calculate the minimum total staked amount needed to exceed current tier
      // If we stake amount x:
      // 1. Total pool becomes: totalValue + x*(1-FEE_RATE)
      // 2. Our staked amount becomes: stakedValue + x*(1-FEE_RATE)
      // 3. We need: (stakedValue + x*(1-FEE_RATE)) / (totalValue + x*(1-FEE_RATE)) > targetPercentage/100
      
      // Solving for x:
      // (stakedValue + x*(1-FEE_RATE)) > (targetPercentage/100)(totalValue + x*(1-FEE_RATE))
      // stakedValue + x*(1-FEE_RATE) > (targetPercentage/100)*totalValue + (targetPercentage/100)*x*(1-FEE_RATE)
      // x*(1-FEE_RATE) - (targetPercentage/100)*x*(1-FEE_RATE) > (targetPercentage/100)*totalValue - stakedValue
      // x*(1-FEE_RATE)*(1 - targetPercentage/100) > (targetPercentage/100)*totalValue - stakedValue
      // x > ((targetPercentage/100)*totalValue - stakedValue) / ((1-FEE_RATE)*(1 - targetPercentage/100))
      
      const targetAmount = (targetPercentage/100) * totalValue;
      const denominator = (1-FEE_RATE) * (1 - targetPercentage/100);
      
      if (denominator !== 0) {
        // Calculate amount needed including fee compensation
        const amountNeeded = (targetAmount - stakedValue) / denominator;
        
        if (amountNeeded > 0) {
          totalAmountForNext = applyWaxPrecision(targetAmount);
          additionalAmountNeeded = applyWaxPrecision(Math.max(0, amountNeeded));
        } else {
          additionalAmountNeeded = 0;
        }
      }
    }

    // Calculate required amount for current tier
    const currentTierThreshold = parseFloat(currentTier.staked_up_to_percent);
    const requiredForCurrent = applyWaxPrecision((currentTierThreshold * totalValue) / 100);

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
      additionalAmountNeeded
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
    const stakedPercent = Math.min((stakedValue / totalValue) * 100, 100);
    
    // Find current tier's "staked up to" percentage
    const currentThreshold = parseFloat(currentTier.staked_up_to_percent);
    
    // If we exceed current tier's threshold, upgrade is available
    return stakedPercent > currentThreshold;
  } catch (error) {
    console.error('Error checking tier upgrade availability:', error);
    return false;
  }
};