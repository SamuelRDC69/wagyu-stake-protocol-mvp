const WAX_PRECISION = 100000000; // 8 decimal places

export const calculateRewards = (
  initialAmount: number,
  emissionRate: number,
  emissionUnit: number,
  elapsedSeconds: number
): number => {
  // Calculate emission per second (50000/100000000 = 0.00000500)
  const emissionPerSecond = (emissionRate / WAX_PRECISION) / emissionUnit;
  
  // Calculate total new emissions
  const newEmissions = elapsedSeconds * emissionPerSecond;
  
  // Return with 8 decimal precision
  return Math.round((initialAmount + newEmissions) * WAX_PRECISION) / WAX_PRECISION;
};

export const parseRewardPool = (rewardPoolQuantity: string): number => {
  const [amount] = rewardPoolQuantity.split(' ');
  return parseFloat(amount);
};