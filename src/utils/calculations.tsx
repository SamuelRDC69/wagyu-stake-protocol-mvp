import { Asset } from '@wharfkit/session';
import { PoolTable, TierTable, StakedTable } from '../types/tables';

export const calculateTierWeight = (
  stakedAmount: Asset,
  totalStaked: Asset,
  tiers: TierTable[]
): TierTable => {
  if (!tiers.length) throw new Error('No tiers configured');

  const stakedPercent = (Number(stakedAmount) / Number(totalStaked)) * 100;
  
  // Sort tiers by staked_up_to_percent ascending
  const sortedTiers = [...tiers].sort(
    (a, b) => a.staked_up_to_percent - b.staked_up_to_percent
  );

  // Find the highest tier that the user qualifies for
  const userTier = sortedTiers.reduce((acc, tier) => {
    if (stakedPercent <= tier.staked_up_to_percent) {
      return tier;
    }
    return acc;
  }, sortedTiers[0]);

  return userTier;
};

export const calculateEffectiveStake = (
  stakedAmount: Asset,
  tierWeight: number
): Asset => {
  const amount = Number(stakedAmount) * tierWeight;
  return Asset.from(`${amount.toFixed(4)} WAX`);
};

export const calculateRewards = (
  stakedAmount: Asset,
  tierWeight: number,
  pool: PoolTable,
  timeSinceLastClaim: number
): Asset => {
  const effectiveStake = calculateEffectiveStake(stakedAmount, tierWeight);
  const emissionPerSecond = pool.emission_rate / pool.emission_unit;
  const rewardAmount = Number(effectiveStake) * emissionPerSecond * (timeSinceLastClaim / 1000);
  
  return Asset.from(`${rewardAmount.toFixed(4)} WAX`);
};

export const calculateAPR = (
  pool: PoolTable,
  tierWeight: number
): number => {
  const annualEmission = (pool.emission_rate / pool.emission_unit) * 31536000; // seconds in a year
  return (annualEmission * tierWeight * 100); // as percentage
};

export const calculateTimeUntilNextTier = (
  currentStaked: Asset,
  totalStaked: Asset,
  nextTier: TierTable
): number => {
  const currentPercent = (Number(currentStaked) / Number(totalStaked)) * 100;
  const targetPercent = nextTier.staked_up_to_percent;
  const additionalStakeNeeded = ((targetPercent - currentPercent) / 100) * Number(totalStaked);
  
  return Math.max(0, additionalStakeNeeded);
};