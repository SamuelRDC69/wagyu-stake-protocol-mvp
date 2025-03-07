import { TierEntity, TierProgress } from '../types/tier';
import { parseTokenString } from './tokenUtils';
import { TIER_CONFIG } from '../config/tierConfig';

// Dynamic fee rate from contract
const FEE_RATE = 0.003; // 0.3% fee as per contract

// Helper function to apply precision based on token decimals
const applyTokenPrecision = (value: number, decimals: number): number => {
  const precision = Math.pow(10, decimals);
  return Math.round(value * precision) / precision;
};

// Debug helper function to log tier information
const logTiers = (tiers: TierEntity[]) => {
  const sortedTiers = [...tiers].sort((a, b) => 
    parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
  );
  
  console.log("Sorted tiers:", sortedTiers.map(t => 
    `${t.tier} (${t.tier_name}): ${t.staked_up_to_percent}% - ${t.weight}x`
  ));
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

    // If pool is empty or user has no stake, return lowest tier
    if (totalValue === 0 || stakedValue === 0) {
      const sortedTiers = [...tiers].sort((a, b) => 
        parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
      );
      
      console.log("Pool empty or no stake, returning lowest tier:", sortedTiers[0]);
      return sortedTiers[0];
    }

    // Calculate percentage with precise decimal handling
    const stakedPercent = (stakedValue / totalValue) * 100;
    console.log(`Determining tier - Staked: ${stakedValue}, Total: ${totalValue}, Percent: ${stakedPercent}%`);

    // Sort tiers by percentage threshold (ascending order)
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );
    
    // Log all tiers for debugging
    logTiers(tiers);

    // Find the appropriate tier based on staked percentage
    let selectedTier = sortedTiers[0]; // Default to lowest tier
    
    for (let i = 0; i < sortedTiers.length; i++) {
      const tier = sortedTiers[i];
      const threshold = parseFloat(tier.staked_up_to_percent);
      
      console.log(`Checking tier ${tier.tier_name} (${tier.tier}): ${threshold}%`);
      
      // If our percentage is below this tier's threshold
      if (stakedPercent < threshold) {
        // If we're at the first tier, use it
        if (i === 0) {
          console.log(`Using first tier: ${tier.tier_name} (${tier.tier})`);
          return tier;
        }
        
        // Otherwise, use the previous tier (highest tier below our percentage)
        const prevTier = sortedTiers[i-1];
        console.log(`Selected tier: ${prevTier.tier_name} (${prevTier.tier})`);
        return prevTier;
      }
      
      // Update the selected tier as we go through the list
      selectedTier = tier;
    }
    
    // If we've checked all thresholds and none are higher than our percentage,
    // use the highest tier
    console.log(`Using highest tier: ${selectedTier.tier_name} (${selectedTier.tier})`);
    return selectedTier;
  } catch (error) {
    console.error('Error determining tier:', error);
    return tiers[0]; // Default to first tier in case of error
  }
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

// Calculate safe unstake amount that won't drop to a lower tier
export const calculateSafeUnstakeAmount = (
  stakedAmount: string,
  totalStaked: string,
  tiers: TierEntity[],
  currentTier: TierEntity
): number => {
  try {
    const { amount: stakedValue, decimals } = parseTokenString(stakedAmount);
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
      return applyTokenPrecision(stakedValue, decimals);
    }

    // Get the previous tier's threshold - need to stay above this to maintain current tier
    const prevTierThreshold = parseFloat(sortedTiers[currentTierIndex - 1].staked_up_to_percent);
    
    // Calculate the minimum required amount to stay at the current tier
    const minRequired = (prevTierThreshold * totalValue) / 100;
    
    // Calculate how much can be safely unstaked while maintaining the current tier
    const safeAmount = Math.max(0, stakedValue - minRequired);
    
    return applyTokenPrecision(safeAmount, decimals);
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
    const { amount: stakedValue, symbol, decimals } = parseTokenString(stakedAmount);
    const { amount: totalValue } = parseTokenString(totalStaked);
    
    if (isNaN(stakedValue) || isNaN(totalValue) || totalValue === 0) {
      return null;
    }

    // Calculate staked percentage
    const stakedPercent = (stakedValue / totalValue) * 100;
    console.log(`Calculating tier progress: Staked ${stakedValue} ${symbol} of ${totalValue} (${stakedPercent}%)`);

    // Sort tiers by percentage threshold
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );

    // Determine current tier using the determineTier function
    const currentTier = determineTier(stakedAmount, totalStaked, tiers);
    console.log(`Determined current tier: ${currentTier.tier_name} (${currentTier.tier})`);
    
    // Find current tier index
    const currentTierIndex = sortedTiers.findIndex(t => t.tier === currentTier.tier);
    
    // Get adjacent tiers
    const nextTier = currentTierIndex < sortedTiers.length - 1 
      ? sortedTiers[currentTierIndex + 1] 
      : undefined;
    const prevTier = currentTierIndex > 0 
      ? sortedTiers[currentTierIndex - 1] 
      : undefined;

    // Calculate progress within current tier
    let progress = 0;
    
    if (nextTier) {
      const currentTierThreshold = parseFloat(currentTier.staked_up_to_percent);
      const nextTierThreshold = parseFloat(nextTier.staked_up_to_percent);
      const prevTierThreshold = prevTier ? parseFloat(prevTier.staked_up_to_percent) : 0;
      
      // If our percentage is between prev tier and current tier
      if (stakedPercent < currentTierThreshold) {
        const rangeSize = currentTierThreshold - prevTierThreshold;
        if (rangeSize > 0) {
          progress = ((stakedPercent - prevTierThreshold) / rangeSize) * 100;
        }
      } else {
        // Our percentage is between current tier and next tier
        const rangeSize = nextTierThreshold - currentTierThreshold;
        if (rangeSize > 0) {
          progress = ((stakedPercent - currentTierThreshold) / rangeSize) * 100;
        }
      }
    } else {
      // For max tier, show 100% progress
      progress = 100;
    }
    
    // Ensure progress is between 0 and 100
    progress = Math.min(100, Math.max(0, progress));

    // Calculate amounts for next tier
    let totalAmountForNext: number | undefined;
    let additionalAmountNeeded: number | undefined;

    if (nextTier) {
      const nextTierThreshold = parseFloat(nextTier.staked_up_to_percent);
      
      // Calculate the total amount needed to reach next tier
      totalAmountForNext = applyTokenPrecision((nextTierThreshold * totalValue) / 100, decimals);
      
      // If we need more than we have
      if (totalAmountForNext > stakedValue) {
        // Account for the fee when staking additional tokens
        const rawAmountNeeded = (totalAmountForNext - stakedValue) / (1 - FEE_RATE);
        additionalAmountNeeded = applyTokenPrecision(rawAmountNeeded, decimals);
      } else {
        additionalAmountNeeded = 0;
      }
    }

    // Calculate required amount for current tier
    const currentTierThreshold = parseFloat(currentTier.staked_up_to_percent);
    const requiredForCurrent = applyTokenPrecision((currentTierThreshold * totalValue) / 100, decimals);

    // Calculate the multiplier weight
    const weight = parseFloat(currentTier.weight);

    console.log(`Progress: ${progress.toFixed(2)}%, Next tier needed: ${additionalAmountNeeded || 'N/A'} ${symbol}`);

    return {
      currentTier,
      nextTier,
      prevTier,
      progress: progress,
      requiredForCurrent,
      totalStaked,
      stakedAmount,
      currentStakedAmount: stakedValue,
      symbol,
      totalAmountForNext,
      additionalAmountNeeded,
      weight
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

// Check if tier upgrade is available
export const isTierUpgradeAvailable = (
  stakedAmount: string,
  totalStaked: string,
  currentTier: TierEntity,
  tiers: TierEntity[]
): boolean => {
  try {
    // Sort tiers by percentage threshold
    const sortedTiers = [...tiers].sort((a, b) => 
      parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
    );
    
    // Find current tier index
    const currentTierIndex = sortedTiers.findIndex(t => t.tier === currentTier.tier);
    
    // If already at max tier, cannot upgrade
    if (currentTierIndex >= sortedTiers.length - 1) {
      return false;
    }
    
    // Get next tier
    const nextTier = sortedTiers[currentTierIndex + 1];
    
    // Determine tier based on actual staked amount
    const actualTier = determineTier(stakedAmount, totalStaked, tiers);
    
    // If actual tier is higher than current tier, upgrade is available
    const actualTierIndex = sortedTiers.findIndex(t => t.tier === actualTier.tier);
    return actualTierIndex > currentTierIndex;
  } catch (error) {
    console.error('Error checking tier upgrade availability:', error);
    return false;
  }
};