import { TierEntity, TierProgress } from '../types/tier';
import { Store, Building2, TrendingUp, BarChart3, Crown } from 'lucide-react';
import { parseTokenString } from './tokenUtils';

const FEE_RATE = 0.003; // 0.3% fee

import { TierEntity, TierProgress } from '../types/tier';
import { Store, Building2, TrendingUp, BarChart3 } from 'lucide-react';
import { parseTokenString } from './tokenUtils';

const FEE_RATE = 0.003; // 0.3% fee

// Updated to match exact contract tier names
export const TIER_CONFIG = {
  supplier: {
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    icon: Store,
  },
  merchant: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    icon: Building2,
  },
  trader: {
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    icon: TrendingUp,
  },
  marketmkr: {
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    icon: BarChart3,
  },
  exchange: {
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
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

    // Sort tiers by staked_up_to_percent ascending (same as contract's index)
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    // Implement lower_bound logic exactly like the contract
    const currentTierIndex = sortedTiers.findIndex(
      tier => parseFloat(tier.staked_up_to_percent) >= stakedPercent
    );

    // If no tier found or empty pool, use first tier
    if (currentTierIndex === -1) {
      const highestTier = sortedTiers[sortedTiers.length - 1];
      return {
        currentTier: highestTier,
        progress: 100,
        requiredForCurrent: parseFloat(highestTier.staked_up_to_percent),
        totalStaked,
        stakedAmount,
        currentStakedAmount: stakedValue.amount,
        symbol: stakedValue.symbol
      };
    }

    const currentTier = sortedTiers[currentTierIndex];
    const nextTier = currentTierIndex < sortedTiers.length - 1 ? sortedTiers[currentTierIndex + 1] : undefined;
    const prevTier = currentTierIndex > 0 ? sortedTiers[currentTierIndex - 1] : undefined;

    // Calculate amounts needed for next tier
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

    // Calculate amount needed to maintain current tier
    const currentTierThreshold = prevTier ? parseFloat(prevTier.staked_up_to_percent) : 0;
    const requiredForCurrent = (currentTierThreshold * totalValue.amount) / 100;

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
  // Direct mapping using exact tier names from contract
  const key = tier.toLowerCase();
  return TIER_CONFIG[key as keyof typeof TIER_CONFIG] || TIER_CONFIG.bronze;
};

// Rest of functions remain the same - they operate on the tier data after it's correctly determined
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
    
    // Sort tiers by threshold ascending
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );
    
    // Find current tier's position
    const currentTierIndex = sortedTiers.findIndex(
      t => t.tier === currentTier.tier
    );
    
    // Check if we exceed the next tier's threshold
    if (currentTierIndex < sortedTiers.length - 1) {
      const nextTier = sortedTiers[currentTierIndex + 1];
      return stakedPercent > parseFloat(nextTier.staked_up_to_percent);
    }
    
    return false;
  } catch (error) {
    console.error('Error in isTierUpgradeAvailable:', error);
    return false;
  }
};
