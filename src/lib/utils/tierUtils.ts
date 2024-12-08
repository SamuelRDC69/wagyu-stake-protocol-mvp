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

    // Calculate percentage exactly like contract
    let stakedPercent = (stakedValue.amount / totalValue.amount) * 100;
    stakedPercent = Math.min(stakedPercent, 100);

    // Sort tiers by percentage threshold ascending
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    // Find tier index based on staked percentage (same as contract's lower_bound)
    const currentTierIndex = sortedTiers.findIndex(
      tier => parseFloat(tier.staked_up_to_percent) >= stakedPercent
    );
    
    // If no tier found (above all thresholds), use last tier
    const finalIndex = currentTierIndex === -1 ? sortedTiers.length - 1 : currentTierIndex;
    const currentTier = sortedTiers[finalIndex];
    const nextTier = finalIndex < sortedTiers.length - 1 ? sortedTiers[finalIndex + 1] : undefined;
    const prevTier = finalIndex > 0 ? sortedTiers[finalIndex - 1] : undefined;

    // Calculate total and additional amounts needed for next tier
    let totalAmountForNext: number | undefined;
    let additionalAmountNeeded: number | undefined;

    if (nextTier) {
      const nextTierThreshold = parseFloat(nextTier.staked_up_to_percent);
      totalAmountForNext = (nextTierThreshold * totalValue.amount) / 100;
      
      if (stakedValue.amount < totalAmountForNext) {
        const rawAmountNeeded = totalAmountForNext - stakedValue.amount;
        additionalAmountNeeded = rawAmountNeeded / (1 - FEE_RATE);
      } else {
        additionalAmountNeeded = 0;
      }
    }

    // Calculate the minimum amount needed to maintain current tier
    const requiredForCurrent = prevTier 
      ? (parseFloat(prevTier.staked_up_to_percent) * totalValue.amount) / 100
      : 0;

    // Calculate progress percentage
    let progress: number;
    if (!nextTier) {
      // At highest tier
      progress = 100;
    } else {
      const currentTierThreshold = parseFloat(currentTier.staked_up_to_percent);
      const nextTierThreshold = parseFloat(nextTier.staked_up_to_percent);
      const prevTierThreshold = prevTier ? parseFloat(prevTier.staked_up_to_percent) : 0;

      // Calculate progress within the current tier range
      const rangeStart = currentTierThreshold;
      const rangeEnd = nextTierThreshold;
      const range = rangeEnd - rangeStart;

      if (range === 0) {
        progress = 100;
      } else {
        // Calculate percentage within the current tier's range
        const relativeProgress = ((stakedPercent - rangeStart) / range) * 100;
        progress = Math.max(0, Math.min(100, relativeProgress));
      }
    }

    // Apply WAX precision (8 decimal places)
    const applyPrecision = (value: number) => Math.round(value * 100000000) / 100000000;

    return {
      currentTier,
      nextTier,
      prevTier,
      progress,
      requiredForCurrent: applyPrecision(requiredForCurrent),
      totalStaked,
      stakedAmount,
      currentStakedAmount: stakedValue.amount,
      symbol: stakedValue.symbol,
      totalAmountForNext: totalAmountForNext ? applyPrecision(totalAmountForNext) : undefined,
      additionalAmountNeeded: additionalAmountNeeded ? applyPrecision(additionalAmountNeeded) : undefined
    };
  } catch (error) {
    console.error('Error in calculateTierProgress:', error);
    return null;
  }
};

export const getTierConfig = (tier: string) => {
  const normalizedTier = tier.toLowerCase().replace(' ', '-');
  return TIER_CONFIG[normalizedTier as keyof typeof TIER_CONFIG] || TIER_CONFIG.supplier;
};

export const isTierUpgradeAvailable = (
  currentStaked: string,
  totalStaked: string,
  currentTier: TierEntity,
  tiers: TierEntity[]
): boolean => {
  try {
    const { amount: stakedValue } = parseTokenString(currentStaked);
    const { amount: totalValue } = parseTokenString(totalStaked);
    
    if (totalValue === 0) return false;
    
    const stakedPercent = (stakedValue / totalValue) * 100;
    
    // Sort tiers by threshold and find next tier
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );
    
    const currentThreshold = parseFloat(currentTier.staked_up_to_percent);
    const nextTier = sortedTiers.find(tier => 
      parseFloat(tier.staked_up_to_percent) > currentThreshold
    );
    
    return nextTier ? stakedPercent >= parseFloat(nextTier.staked_up_to_percent) : false;
  } catch (error) {
    console.error('Error in isTierUpgradeAvailable:', error);
    return false;
  }
};