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

    let currentTier = sortedTiers[0];

    // Loop through tiers - if we exceed a tier's "up to" percentage, we're in the next tier
    for (let i = 0; i < sortedTiers.length - 1; i++) {
      if (stakedPercent > parseFloat(sortedTiers[i].staked_up_to_percent)) {
        currentTier = sortedTiers[i + 1];
      } else {
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
    const minRequired = (prevTierThreshold * totalValue) / 100;

    // Calculate how much we can unstake while staying above previous tier's threshold
    const safeAmount = Math.max(0, stakedValue - minRequired);
    
    return applyWaxPrecision(safeAmount);
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
      const currentThreshold = parseFloat(currentTier.staked_up_to_percent);
      const prevThreshold = prevTier 
        ? parseFloat(prevTier.staked_up_to_percent) 
        : 0;
      progress = ((stakedPercent - prevThreshold) / (currentThreshold - prevThreshold)) * 100;
    } else {
      progress = 100; // Max tier
    }

    // Calculate amounts for next tier
    let totalAmountForNext: number | undefined;
    let additionalAmountNeeded: number | undefined;

    if (nextTier) {
      const nextTierThreshold = parseFloat(nextTier.staked_up_to_percent);
      totalAmountForNext = applyWaxPrecision((nextTierThreshold * totalValue) / 100);
      
      if (stakedValue < totalAmountForNext) {
        const totalNeededWithFee = applyWaxPrecision(totalAmountForNext / (1 - FEE_RATE));
        additionalAmountNeeded = applyWaxPrecision(Math.max(0, totalNeededWithFee - stakedValue));
      } else {
        additionalAmountNeeded = 0;
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