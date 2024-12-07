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
 * Calculates tier progress exactly matching contract behavior
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

    // Calculate percentage exactly like contract
    let stakedPercent = (stakedValue.amount / totalValue.amount) * 100;
    stakedPercent = Math.min(stakedPercent, 100);

    // Find current tier - use contract's lower_bound logic but preserve tier order
    let currentTierIndex = -1;
    let lowestMatchingThreshold = Infinity;
    tiers.forEach((tier, index) => {
      const threshold = parseFloat(tier.staked_up_to_percent);
      if (threshold <= stakedPercent && threshold <= lowestMatchingThreshold) {
        lowestMatchingThreshold = threshold;
        currentTierIndex = index;
      }
    });

    // If no tier found, use base tier
    if (currentTierIndex === -1) {
      currentTierIndex = tiers.length - 1;
    }

    const currentTier = tiers[currentTierIndex];
    const nextTierIndex = tiers.findIndex(tier => 
      parseFloat(tier.staked_up_to_percent) > stakedPercent
    );
    const nextTier = nextTierIndex !== -1 ? tiers[nextTierIndex] : undefined;

    // Find prev tier
    const prevTierThreshold = Math.max(...tiers
      .map(t => parseFloat(t.staked_up_to_percent))
      .filter(p => p < parseFloat(currentTier.staked_up_to_percent))
    );
    const prevTier = tiers.find(t => parseFloat(t.staked_up_to_percent) === prevTierThreshold);

    // Calculate amounts needed for next tier
    let totalAmountForNext: number | undefined;
    let additionalAmountNeeded: number | undefined;

    if (nextTier) {
      // Need to exceed the threshold percentage
      const nextTierThreshold = parseFloat(nextTier.staked_up_to_percent);
      totalAmountForNext = (nextTierThreshold * totalValue.amount) / 100;
      
      if (stakedValue.amount < totalAmountForNext) {
        // Calculate raw amount needed first
        const rawAmountNeeded = totalAmountForNext - stakedValue.amount;
        // Adjust for 0.3% fee: amount = rawAmount / (1 - fee)
        additionalAmountNeeded = rawAmountNeeded / (1 - FEE_RATE);
      } else {
        additionalAmountNeeded = 0;
      }
    }

    // Calculate amount needed to maintain current tier
    const requiredForCurrent = prevTier 
      ? (parseFloat(prevTier.staked_up_to_percent) * totalValue.amount) / 100 
      : 0;

    // Calculate progress to next tier
    let progress: number;
    if (nextTier) {
      const nextTierThreshold = parseFloat(nextTier.staked_up_to_percent);
      const currentTierThreshold = parseFloat(currentTier.staked_up_to_percent);
      const range = nextTierThreshold - currentTierThreshold;
      progress = ((stakedPercent - currentTierThreshold) / range) * 100;
    } else {
      progress = 100; // At highest tier
    }

    // Apply WAX precision (8 decimal places)
    const applyPrecision = (value: number) => Math.round(value * 100000000) / 100000000;

    return {
      currentTier,
      nextTier,
      prevTier,
      progress: Math.min(Math.max(0, progress), 100),
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
  const normalizedTier = tier.toLowerCase().replace(/\s+/g, '');
  return TIER_CONFIG[normalizedTier as keyof typeof TIER_CONFIG] || TIER_CONFIG.supplier;
};

export const getProgressColor = (progress: number): string => {
  if (progress < 33) return TIER_CONFIG.supplier.progressColor;
  if (progress < 66) return TIER_CONFIG.marketmkr.progressColor;
  return TIER_CONFIG.exchange.progressColor;
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
    
    const stakedPercent = (stakedValue / totalValue) * 100;
    
    // Use original tier array order
    const currentTierIndex = tiers.findIndex(t => t.tier === currentTier.tier);
    
    // Find next tier in sequence that has a higher threshold
    const nextTier = tiers.find(t => 
      parseFloat(t.staked_up_to_percent) > parseFloat(currentTier.staked_up_to_percent)
    );
    
    if (nextTier) {
      return stakedPercent > parseFloat(nextTier.staked_up_to_percent);
    }
    
    return false;
  } catch (error) {
    console.error('Error in isTierUpgradeAvailable:', error);
    return false;
  }
};