import { TierEntity, TierProgress } from '@/lib/types/tier';
import { StakedEntity } from '@/lib/types/staked';
import { PoolEntity } from '@/lib/types/pool';
import { Store, Building2, TrendingUp, BarChart3 } from 'lucide-react';
import { parseTokenString } from '@/lib/utils/tokenUtils';
import { cn } from '@/lib/utils';

// Using consistent color patterns from the project's theme
export const TIER_CONFIG = {
  supplier: {
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    progressColor: 'bg-emerald-500/50 group-hover:bg-emerald-500',
    borderColor: 'border-emerald-500/20',
    icon: Store,
  },
  merchant: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    progressColor: 'bg-blue-500/50 group-hover:bg-blue-500',
    borderColor: 'border-blue-500/20',
    icon: Building2,
  },
  trader: {
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    progressColor: 'bg-purple-500/50 group-hover:bg-purple-500',
    borderColor: 'border-purple-500/20',
    icon: TrendingUp,
  },
  'market maker': {
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    progressColor: 'bg-amber-500/50 group-hover:bg-amber-500',
    borderColor: 'border-amber-500/20',
    icon: BarChart3,
  },
  exchange: {
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    progressColor: 'bg-red-500/50 group-hover:bg-red-500',
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

    let stakedPercent = (stakedValue.amount / totalValue.amount) * 100;
    stakedPercent = Math.min(stakedPercent, 100);

    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    const tierIndex = sortedTiers.findIndex(
      tier => parseFloat(tier.staked_up_to_percent) >= stakedPercent
    );

    if (tierIndex === -1) {
      const highestTier = sortedTiers[sortedTiers.length - 1];
      return {
        currentTier: highestTier,
        progress: 100,
        requiredForCurrent: totalValue.amount * (parseFloat(highestTier.staked_up_to_percent) / 100),
        totalStaked,
        stakedAmount,
        currentStakedAmount: stakedValue.amount,
        symbol: stakedValue.symbol
      };
    }

    const currentTier = sortedTiers[tierIndex];
    const prevTier = tierIndex > 0 ? sortedTiers[tierIndex - 1] : undefined;
    const nextTier = tierIndex < sortedTiers.length - 1 ? sortedTiers[tierIndex + 1] : undefined;

    const currentThreshold = parseFloat(currentTier.staked_up_to_percent);
    const prevThreshold = prevTier ? parseFloat(prevTier.staked_up_to_percent) : 0;
    
    const progress = prevThreshold === currentThreshold 
      ? 100 
      : ((stakedPercent - prevThreshold) / (currentThreshold - prevThreshold)) * 100;

    return {
      currentTier,
      nextTier,
      prevTier,
      progress: Math.min(Math.max(0, progress), 100),
      requiredForNext: nextTier ? totalValue.amount * (parseFloat(nextTier.staked_up_to_percent) / 100) : undefined,
      requiredForCurrent: totalValue.amount * (currentThreshold / 100),
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
  const tierKey = tier.toLowerCase() as keyof typeof TIER_CONFIG;
  return TIER_CONFIG[tierKey] || TIER_CONFIG.supplier;
};

export const getProgressColor = (progress: number): string => {
  if (progress < 33) return TIER_CONFIG.supplier.progressColor;
  if (progress < 66) return TIER_CONFIG['market maker'].progressColor;
  return TIER_CONFIG.exchange.progressColor;
};

export const calculateRequiredTokens = (
  required: number,
  current: number,
  symbol: string
): string => {
  const remaining = Math.max(0, required - current);
  if (remaining === 0) return 'Requirement Met!';
  return `${remaining.toFixed(8)} ${symbol} more needed`;
};