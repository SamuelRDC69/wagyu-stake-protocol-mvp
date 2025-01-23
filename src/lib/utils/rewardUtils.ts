// src/lib/utils/rewardUtils.ts

const WAX_PRECISION = 100000000; // 8 decimal places

export const calculateEmissionsPerSecond = (
  emissionRate: number,
  emissionUnit: number
): number => {
  return (emissionRate / WAX_PRECISION) / emissionUnit;
};

export const calculateRewards = (
  initialAmount: number,
  emissionRate: number,
  emissionUnit: number,
  elapsedSeconds: number
): number => {
  // Calculate emissions exactly like the contract
  const emissionsPerSecond = calculateEmissionsPerSecond(emissionRate, emissionUnit);
  const newEmissions = elapsedSeconds * emissionsPerSecond;
  
  // Return with 8 decimal precision
  return Math.round((initialAmount + newEmissions) * WAX_PRECISION) / WAX_PRECISION;
};

export const parseRewardPool = (rewardPoolQuantity: string): number => {
  const [amount] = rewardPoolQuantity.split(' ');
  return parseFloat(amount);
};