const WAX_PRECISION = 100000000; // 8 decimal places

export const calculateRewards = (
  initialAmount: number,
  emissionRate: number,
  emissionUnit: number,
  elapsedSeconds: number
): number => {
  // Match contract calculation exactly
  const emissionPerSecond = emissionRate / (emissionUnit * WAX_PRECISION);
  
  // Calculate total new emissions
  const newEmissions = elapsedSeconds * emissionPerSecond;
  
  // Return with 8 decimal precision
  return Math.round((initialAmount + newEmissions) * WAX_PRECISION) / WAX_PRECISION;
};