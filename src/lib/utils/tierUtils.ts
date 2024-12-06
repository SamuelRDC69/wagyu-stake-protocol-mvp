import { TierEntity, TierProgress } from '@/lib/types/tier';
import { StakedEntity } from '@/lib/types/staked';
import { PoolEntity } from '@/lib/types/pool';
import { Store, Building2, TrendingUp, BarChart3 } from 'lucide-react';
import { parseTokenString } from '@/lib/utils/tokenUtils';
import { cn } from '@/lib/utils';

const FEE_RATE = 0.003; // 0.3% fee

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
      console.log('Invalid amounts:', { stakedValue, totalValue });
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
      const highestThreshold = parseFloat(highestTier.staked_up_to_percent);
      
      return {
        currentTier: highestTier,
        progress: 100,
        requiredForCurrent: (highestThreshold / 100) * totalValue.amount,
        totalStaked,
        stakedAmount,
        currentStakedAmount: stakedValue.amount,
        symbol: stakedValue.symbol,
        prevTier,
        nextTier: undefined,
        requiredForNext: undefined
      };
    }

    const currentTier = sortedTiers[tierIndex];
    const prevTier = tierIndex > 0 ? sortedTiers[tierIndex - 1] : undefined;
    const nextTier = tierIndex < sortedTiers.length - 1 ? sortedTiers[tierIndex + 1] : undefined;

    // Calculate required amounts
    const currentThresholdPercent = parseFloat(currentTier.staked_up_to_percent);
    const prevThresholdPercent = prevTier ? parseFloat(prevTier.staked_up_to_percent) : 0;

    // Required amount for current tier (used for safe unstake calculation)
    const requiredForCurrent = (currentThresholdPercent / 100) * totalValue.amount;

    // Calculate additional amount needed for next tier
    let requiredForNext: number | undefined;
    if (nextTier) {
        // Calculate amount needed for next tier percentage
        const nextTierThresholdPercent = parseFloat(nextTier.staked_up_to_percent);
        const nextTierRequiredAmount = (nextTierThresholdPercent / 100) * totalValue.amount;

        if (stakedValue.amount >= nextTierRequiredAmount) {
            requiredForNext = 0;
        } else {
            // Calculate additional amount needed
            const baseAmountNeeded = nextTierRequiredAmount - stakedValue.amount;
            // Add fee adjustment: amount = target / (1 - fee_rate)
            const withFee = baseAmountNeeded / (1 - FEE_RATE);
            // Round to 8 decimal places
            requiredForNext = Math.ceil(withFee * 100000000) / 100000000;
        }
    }

    // Calculate progress between current tier boundaries
    let progress: number;
    if (prevTier) {
        const range = currentThresholdPercent - prevThresholdPercent;
        const position = stakedPercent - prevThresholdPercent;
        progress = (position / range) * 100;
    } else {
        progress = (stakedPercent / currentThresholdPercent) * 100;
    }

    return {
        currentTier,
        nextTier,
        prevTier,
        progress: Math.min(Math.max(0, progress), 100),
        requiredForCurrent,
        requiredForNext,
        totalStaked,
        stakedAmount,
        currentStakedAmount: stakedValue.amount,
        symbol: stakedValue.symbol
    };
  } catch (error) {
    console.error('Error in calculateTierProgress:', error);
    return null;
  }
};

export const getTierConfig = (tier: string) => {
  const contractTierName = tier.toLowerCase();
  return TIER_CONFIG[contractTierName as keyof typeof TIER_CONFIG] || TIER_CONFIG.supplier;
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
    
    // Sort tiers in descending order
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