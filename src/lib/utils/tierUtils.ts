import { TierEntity, TierProgress } from '../types/tier';
import { StakedEntity } from '../types/staked';
import { PoolEntity } from '../types/pool';
import { parseTokenString } from './tokenUtils';

export const calculateTierProgress = (
  stakedAmount: string,
  totalStaked: string,
  tiers: TierEntity[]
): TierProgress => {
  const stakedPercent = (parseTokenString(stakedAmount).amount / 
    parseTokenString(totalStaked).amount) * 100;

  // Sort tiers by staked_up_to_percent
  const sortedTiers = [...tiers].sort((a, b) => 
    a.staked_up_to_percent - b.staked_up_to_percent);

  let currentTier = sortedTiers[0];
  let nextTier: TierEntity | undefined;
  let prevTier: TierEntity | undefined;

  for (let i = 0; i < sortedTiers.length; i++) {
    if (stakedPercent <= sortedTiers[i].staked_up_to_percent) {
      currentTier = sortedTiers[i];
      nextTier = sortedTiers[i + 1];
      prevTier = sortedTiers[i - 1];
      break;
    }
  }

  const progress = prevTier ? 
    ((stakedPercent - prevTier.staked_up_to_percent) / 
    (currentTier.staked_up_to_percent - prevTier.staked_up_to_percent)) * 100 :
    (stakedPercent / currentTier.staked_up_to_percent) * 100;

  return {
    currentTier,
    nextTier,
    prevTier,
    progress: Math.min(progress, 100),
    requiredForNext: nextTier?.staked_up_to_percent,
    requiredForCurrent: currentTier.staked_up_to_percent
  };
};

export const getTierColor = (tier: string): string => {
  switch (tier.toLowerCase()) {
    case 'bronze': return 'text-amber-500';
    case 'silver': return 'text-slate-300';
    case 'gold': return 'text-yellow-500';
    default: return 'text-purple-500';
  }
};

export const getTierWeight = (tier: string, tiers: TierEntity[]): number => {
  const tierEntity = tiers.find(t => t.tier === tier);
  return tierEntity?.weight || 1;
};

export const isTierUpgradeAvailable = (
  currentStaked: string,
  totalStaked: string,
  currentTier: TierEntity,
  tiers: TierEntity[]
): boolean => {
  const stakedPercent = (parseTokenString(currentStaked).amount / 
    parseTokenString(totalStaked).amount) * 100;
  
  const nextTier = tiers.find(t => 
    t.staked_up_to_percent > currentTier.staked_up_to_percent);
    
  return !!nextTier && stakedPercent >= currentTier.staked_up_to_percent;
};