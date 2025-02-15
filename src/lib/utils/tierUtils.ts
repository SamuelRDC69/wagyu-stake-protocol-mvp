import { TierEntity, TierProgress } from '../types/tier';
import { parseTokenString } from './tokenUtils';
import { TIER_CONFIG } from '../config/tierConfig';

const FEE_RATE = 0.003; // 0.3% fee as per contract
const PRECISION = 100000000; // 8 decimal places for WAX

// Define the progression type
type TierProgressionType = keyof typeof TIER_CONFIG;

// Tier progression order matching contract (a through v)
const TIER_PROGRESSION = Object.keys(TIER_CONFIG) as TierProgressionType[];

// Sort tiers to match progression
const sortTiersByProgression = (tiers: TierEntity[]): TierEntity[] => {
  return [...tiers].sort((a, b) => {
    const aIndex = TIER_PROGRESSION.indexOf(a.tier.toLowerCase() as TierProgressionType);
    const bIndex = TIER_PROGRESSION.indexOf(b.tier.toLowerCase() as TierProgressionType);
    return aIndex - bIndex;
  });
};

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

// Export tier determination logic
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
      const lowestTier = sortTiersByProgression(tiers)[0];
      return lowestTier;
    }

    // Calculate percentage with precise decimal handling
    const stakedPercent = Math.min((stakedValue / totalValue) * 100, 100);

    // Sort tiers by percentage threshold
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    // Find first tier where threshold exceeds staked percentage
    for (const tier of sortedTiers) {
      if (parseFloat(tier.staked_up_to_percent) > stakedPercent) {
        const currentIndex = sortedTiers.indexOf(tier);
        return currentIndex > 0 ? sortedTiers[currentIndex - 1] : sortedTiers[0];
      }
    }

    // If no tier found, use highest tier
    return sortedTiers[sortedTiers.length - 1];
  } catch (error) {
    console.error('Error determining tier:', error);
    return tiers[0];
  }
};

// Calculate safe unstake amount that won't drop tier (WITHOUT fee consideration)
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

    // Calculate minimum amount needed using integer arithmetic
    const currentTierThreshold = parseFloat(currentTier.staked_up_to_percent);
    const minRequiredRaw = (currentTierThreshold * totalValue) / 100;
    const minRequired = applyWaxPrecision(minRequiredRaw);

    // Calculate maximum safe unstake amount (without fee since fee is for staking only)
    const safeAmount = Math.max(0, stakedValue - minRequired);

    return applyWaxPrecision(safeAmount);
  } catch (error) {
    console.error('Error calculating safe unstake amount:', error);
    return 0;
  }
};

// Calculate tier progress matching contract logic
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

    // Calculate stake percentage exactly like contract
    const stakedPercent = Math.min((stakedValue / totalValue) * 100, 100);

    // Determine current tier using contract logic
    const currentTier = determineTier(stakedAmount, totalStaked, tiers);

    // Sort tiers for progression calculation
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

    // Calculate amounts needed for next tier
    let totalAmountForNext: number | undefined;
    let additionalAmountNeeded: number | undefined;

    if (nextTier) {
      const nextTierThreshold = parseFloat(nextTier.staked_up_to_percent);
      // Calculate base amount needed for next tier
      totalAmountForNext = applyWaxPrecision((nextTierThreshold * totalValue) / 100);
      
      if (stakedValue < totalAmountForNext) {
        // Example: If we need 100 WAX total staked:
        // 1. When user stakes X WAX, they only get X * (1 - fee) = X * 0.997 credited
        // 2. So if we need 100 WAX credited, they need to stake 100 / 0.997 ≈ 100.3009 WAX
        // 3. Then subtract what they already have staked
        const totalNeededWithFee = applyWaxPrecision(totalAmountForNext / (1 - FEE_RATE));
        additionalAmountNeeded = applyWaxPrecision(Math.max(0, totalNeededWithFee - stakedValue));
      } else {
        additionalAmountNeeded = 0;
      }
    }

    // Calculate amount needed to maintain current tier
    const currentTierThreshold = parseFloat(currentTier.staked_up_to_percent);
    const requiredForCurrent = applyWaxPrecision((currentTierThreshold * totalValue) / 100);

    // Calculate progress percentage
    let progress: number;
    if (nextTier) {
      const nextTierThreshold = parseFloat(nextTier.staked_up_to_percent);
      const currentTierThreshold = parseFloat(currentTier.staked_up_to_percent);
      const range = nextTierThreshold - currentTierThreshold;
      progress = ((stakedPercent - currentTierThreshold) / range) * 100;
    } else {
      progress = 100;
    }

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

export const isTierUpgradeAvailable = (
  currentStaked: string,
  totalStaked: string,
  currentTier: TierEntity,
  tiers: TierEntity[]
): boolean => {
  try {
    // Get next tier threshold
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );
    
    const currentTierIndex = sortedTiers.findIndex(t => t.tier === currentTier.tier);
    if (currentTierIndex >= sortedTiers.length - 1) return false;
    
    const nextTier = sortedTiers[currentTierIndex + 1];
    
    // Calculate current percentage with contract precision
    const { amount: stakedValue } = parseTokenString(currentStaked);
    const { amount: totalValue } = parseTokenString(totalStaked);
    const stakedPercent = applyWaxPrecision((stakedValue / totalValue) * 100);
    
    // Check if we exceed next tier's threshold
    return stakedPercent > parseFloat(nextTier.staked_up_to_percent);
  } catch (error) {
    console.error('Error checking tier upgrade availability:', error);
    return false;
  }
};

export const getTierDisplayName = (tierKey: string): string => {
  return TIER_CONFIG[tierKey.toLowerCase()]?.displayName || tierKey;
};

export const getTierWeight = (tierKey: string): string => {
  return TIER_CONFIG[tierKey.toLowerCase()]?.weight || '1.0';
};
