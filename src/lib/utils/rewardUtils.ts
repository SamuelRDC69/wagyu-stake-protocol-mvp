// src/lib/utils/rewardUtils.ts

const WAX_PRECISION = 100000000; // 8 decimal places

export const calculateRewards = (
  initialAmount: number,
  emissionRate: number,
  emissionUnit: number,
  elapsedSeconds: number
): number => {
  // Convert rate to proper decimal (50000 -> 0.00000500)
  const ratePerSecond = emissionRate / WAX_PRECISION;
  
  // Calculate new emissions maintaining precision
  const newEmissions = (elapsedSeconds * ratePerSecond) / emissionUnit;
  
  // Round to 8 decimal places
  return Math.round((initialAmount + newEmissions) * WAX_PRECISION) / WAX_PRECISION;
};

export const parseRewardPool = (rewardPoolQuantity: string): number => {
  const [amount] = rewardPoolQuantity.split(' ');
  return parseFloat(amount);
};