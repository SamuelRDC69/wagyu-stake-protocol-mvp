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

    // Find your actual tier by finding highest threshold you exceed
    const currentTierIndex = sortedTiers.reduce((highest, tier, index) => {
      if (stakedPercent > parseFloat(tier.staked_up_to_percent)) {
        return index;
      }
      return highest;
    }, 0);

    const currentTier = sortedTiers[currentTierIndex];
    const nextTier = currentTierIndex < sortedTiers.length - 1 ? sortedTiers[currentTierIndex + 1] : undefined;
    const prevTier = currentTierIndex > 0 ? sortedTiers[currentTierIndex - 1] : undefined;

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

    // For safe unstake: can unstake down to the prevTier threshold
    const requiredForCurrent = prevTier 
      ? (parseFloat(prevTier.staked_up_to_percent) * totalValue.amount) / 100
      : 0;

    // Calculate progress to next tier
    let progress: number;
    if (nextTier) {
      const nextTierThreshold = parseFloat(nextTier.staked_up_to_percent);
      const currentTierThreshold = parseFloat(currentTier.staked_up_to_percent);
      const range = nextTierThreshold - currentTierThreshold;
      progress = range === 0 ? 100 : ((stakedPercent - currentTierThreshold) / range) * 100;
    } else {
      progress = 100; // At highest tier
    }

    // Apply WAX precision (8 decimal places)
    const applyPrecision = (value: number) => Math.round(value * 100000000) / 100000000;

    return {
      currentTier, // Use actual tier
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
  // Match UserStatus.tsx tier normalization
  const normalizedTier = tier.toLowerCase().replace(' ', '-');
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