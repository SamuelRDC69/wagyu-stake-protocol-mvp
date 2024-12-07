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
 * Calculate percentage exactly like the contract
 */
const calculateStakedPercent = (stakedAmount: number, totalPool: number): number => {
    return Math.min((stakedAmount / totalPool) * 100, 100);
};

/**
 * Calculate safe unstake amount to maintain previous tier
 */
const calculateSafeUnstake = (
    currentStake: number,
    totalPool: number,
    prevTierPercent: number
): number => {
    // Calculate minimum required for previous tier
    const minRequired = (totalPool * prevTierPercent) / 100;
    return Math.max(0, currentStake - minRequired);
};

/**
 * Calculate incremental amount needed for next tier
 */
const calculateIncrementalNeed = (
    currentStake: number,
    totalPool: number,
    targetTierPercent: number
): { totalNeeded: number; additionalNeeded: number } => {
    // Calculate the target amount including current stake
    const targetAmount = Math.ceil((totalPool * targetTierPercent / 100) * 100000000) / 100000000;
    
    // If we're already at or above target, no additional needed
    if (currentStake >= targetAmount) {
        return {
            totalNeeded: currentStake,
            additionalNeeded: 0
        };
    }

    // Calculate raw additional amount needed
    const rawAdditional = targetAmount - currentStake;
    
    // Apply fee to additional amount
    const withFee = Math.ceil((rawAdditional / (1 - FEE_RATE)) * 100000000) / 100000000;

    return {
        totalNeeded: currentStake + withFee,
        additionalNeeded: withFee
    };
};

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
    const stakedPercent = calculateStakedPercent(stakedValue.amount, totalValue.amount);

    // Sort tiers by staked_up_to_percent ascending
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    // Find current tier using contract's lower_bound logic
    const tierIndex = sortedTiers.findIndex(
      tier => parseFloat(tier.staked_up_to_percent) >= stakedPercent
    );

    if (tierIndex === -1) {
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

    // Calculate amounts for next tier
    let totalAmountForNext: number | undefined;
    let additionalAmountNeeded: number | undefined;

    if (nextTier) {
        const nextTierPercent = parseFloat(nextTier.staked_up_to_percent);
        if (nextTierPercent === 100) {
            // Handle Exchange tier differently
            totalAmountForNext = totalValue.amount;
            const rawAdditional = totalValue.amount - stakedValue.amount;
            additionalAmountNeeded = Math.ceil((rawAdditional / (1 - FEE_RATE)) * 100000000) / 100000000;
        } else {
            const required = calculateIncrementalNeed(
                stakedValue.amount,
                totalValue.amount,
                nextTierPercent
            );
            totalAmountForNext = required.totalNeeded;
            additionalAmountNeeded = required.additionalNeeded;
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

    // Calculate safe unstake amount
    const safeUnstakeAmount = prevTier 
        ? calculateSafeUnstake(
            stakedValue.amount,
            totalValue.amount,
            parseFloat(prevTier.staked_up_to_percent)
          )
        : 0;

    return {
        currentTier,
        nextTier,
        prevTier,
        progress: Math.min(Math.max(0, progress), 100),
        requiredForCurrent: safeUnstakeAmount,
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
    
    const stakedPercent = calculateStakedPercent(stakedValue, totalValue);
    
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(b.staked_up_to_percent) - parseFloat(a.staked_up_to_percent)
    );
    
    const currentTierIndex = sortedTiers.findIndex(
      t => t.tier === currentTier.tier
    );
    
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