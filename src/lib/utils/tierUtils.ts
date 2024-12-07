// src/lib/utils/tierUtils.ts
import { TierEntity, TierProgress } from '../types/tier';
import { Store, Building2, TrendingUp, BarChart3 } from 'lucide-react';
import { parseTokenString } from './tokenUtils';
import { cn } from '@/lib/utils';

const FEE_RATE = 0.003; // 0.3% fee

// Tier configuration with styling and icons
export const TIER_CONFIG = {
  supplier: {
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    progressColor: 'bg-emerald-500',
    borderColor: 'border-emerald-500/20',
    icon: Store,
  },
  merchant: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    progressColor: 'bg-blue-500',
    borderColor: 'border-blue-500/20',
    icon: Building2,
  },
  trader: {
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    progressColor: 'bg-purple-500',
    borderColor: 'border-purple-500/20',
    icon: TrendingUp,
  },
  marketmkr: {
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    progressColor: 'bg-amber-500',
    borderColor: 'border-amber-500/20',
    icon: BarChart3,
  },
  exchange: {
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    progressColor: 'bg-red-500',
    borderColor: 'border-red-500/20',
    icon: Building2,
  },
} as const;

/**
 * Calculates progress and requirements for tier advancement
 */
export const calculateTierProgress = (
  stakedAmount: string,
  totalStaked: string,
  tiers: TierEntity[]
): TierProgress | null => {
  try {
    const stakedValue = parseTokenString(stakedAmount);
    const totalValue = parseTokenString(totalStaked);
    
    if (isNaN(stakedValue.amount) || isNaN(totalValue.amount) || totalValue.amount === 0) {
      return null;
    }

    // Calculate percentage exactly like the contract
    let stakedPercent = (stakedValue.amount / totalValue.amount) * 100;
    stakedPercent = Math.min(stakedPercent, 100);

    // Sort tiers by staked_up_to_percent ascending
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    // Find first tier where threshold >= staked percentage (lower_bound)
    const tierIndex = sortedTiers.findIndex(
      tier => parseFloat(tier.staked_up_to_percent) >= stakedPercent
    );

    if (tierIndex === -1) {
      // No tier found means we're beyond all thresholds, use highest tier
      const highestTier = sortedTiers[sortedTiers.length - 1];
      const prevTier = sortedTiers[sortedTiers.length - 2];
      
      return {
        currentTier: highestTier,
        progress: 100,
        requiredForCurrent: stakedValue.amount,
        totalStaked,
        stakedAmount,
        currentStakedAmount: stakedValue.amount,
        symbol: stakedValue.symbol,
        prevTier,
        nextTier: undefined,
        totalAmountForNext: undefined,
        additionalAmountNeeded: undefined
      };
    }

    const currentTier = sortedTiers[tierIndex];
    const prevTier = tierIndex > 0 ? sortedTiers[tierIndex - 1] : undefined;
    const nextTier = tierIndex < sortedTiers.length - 1 ? sortedTiers[tierIndex + 1] : undefined;

    // Calculate both amounts for next tier
    let totalAmountForNext: number | undefined;
    let additionalAmountNeeded: number | undefined;

    if (nextTier) {
        const nextTierPercent = parseFloat(nextTier.staked_up_to_percent);
        
        // Calculate how much total stake would give us the required percentage
        // If P is the percentage we want, T is current total pool, and X is how much we need:
        // X / (T + X) = P/100
        // Solving for X: X = (T * P) / (100 - P)
        const currentTotal = totalValue.amount;
        const requiredStakeForPercent = (currentTotal * nextTierPercent) / (100 - nextTierPercent);
        
        // Round to 8 decimal places (WAX precision)
        totalAmountForNext = Math.ceil(requiredStakeForPercent * 100000000) / 100000000;

        if (stakedValue.amount >= totalAmountForNext) {
            additionalAmountNeeded = 0;
        } else {
            const rawAmountNeeded = totalAmountForNext - stakedValue.amount;
            // Apply fee adjustment
            additionalAmountNeeded = Math.ceil((rawAmountNeeded / (1 - FEE_RATE)) * 100000000) / 100000000;
        }
    }

    // Calculate progress between tier boundaries
    const currentThresholdPercent = parseFloat(currentTier.staked_up_to_percent);
    const prevThresholdPercent = prevTier ? parseFloat(prevTier.staked_up_to_percent) : 0;
    
    let progress: number;
    if (prevTier) {
        const range = currentThresholdPercent - prevThresholdPercent;
        const position = stakedPercent - prevThresholdPercent;
        progress = (position / range) * 100;
    } else {
        progress = (stakedPercent / currentThresholdPercent) * 100;
    }

    // Calculate safe unstake amount - this is the amount that can be unstaked
    // while maintaining the previous tier's percentage requirement
    const currentTotal = totalValue.amount - stakedValue.amount; // Updated pool size after unstake
    const requiredForPrevTier = prevTier 
        ? (currentTotal * parseFloat(prevTier.staked_up_to_percent)) / 100
        : 0;

    const safeUnstake = Math.max(0, stakedValue.amount - requiredForPrevTier);
    
    return {
        currentTier,
        nextTier,
        prevTier,
        progress: Math.min(Math.max(0, progress), 100),
        requiredForCurrent: requiredForPrevTier,
        requiredForNext: additionalAmountNeeded,
        totalStaked,
        stakedAmount,
        currentStakedAmount: stakedValue.amount,
        symbol: stakedValue.symbol,
        totalAmountForNext,
        additionalAmountNeeded
    };
  } catch (error) {
    console.error('Error in calculateTierProgress:', error);
    return null;
  }
};

/**
 * Gets tier styling configuration
 */
export const getTierConfig = (tier: string) => {
  const contractTierName = tier.toLowerCase();
  return TIER_CONFIG[contractTierName as keyof typeof TIER_CONFIG] || TIER_CONFIG.supplier;
};

/**
 * Gets progress bar color based on completion percentage
 */
export const getProgressColor = (progress: number): string => {
  if (progress < 33) return TIER_CONFIG.supplier.progressColor;
  if (progress < 66) return TIER_CONFIG.marketmkr.progressColor;
  return TIER_CONFIG.exchange.progressColor;
};

/**
 * Checks if user can upgrade to next tier
 */
export const isTierUpgradeAvailable = (
  currentStaked: string,
  totalStaked: string,
  currentTier: TierEntity,
  tiers: TierEntity[]
): boolean => {
  try {
    const { amount: stakedValue } = parseTokenString(currentStaked);
    const { amount: totalValue } = parseTokenString(totalStaked);
    
    // Calculate percentage like the contract
    const stakedPercent = (stakedValue / totalValue) * 100;
    
    // Sort tiers in descending order for checking upgrades
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