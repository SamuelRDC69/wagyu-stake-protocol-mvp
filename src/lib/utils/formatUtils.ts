import { parseTokenString } from './tokenUtils';

export const formatNumber = (num: number, decimals: number = 8): string => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatPercent = (num: number): string => {
  return `${num.toFixed(2)}%`;
};

export const formatEmissionRate = (unit: number, rate: number, decimals: number = 8): string => {
  const perHour = (3600 / unit) * rate;
  return formatNumber(perHour, decimals);
};

export const shortenAddress = (address: string, chars: number = 4): string => {
  if (!address) return '';
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

export const formatPoolStats = (
  totalStaked: string,
  emissionRate: number,
  emissionUnit: number,
  poolQuantity: string // Add this parameter to get decimals from pool
): string => {
  // Get decimals from pool quantity
  const { decimals } = parseTokenString(poolQuantity);
  
  const hourlyEmission = formatEmissionRate(emissionUnit, emissionRate, decimals);
  return `${formatNumber(parseFloat(totalStaked), decimals)} (${hourlyEmission}/hr)`;
};

// Helper function for consistent decimal handling
export const formatTokenValue = (value: string | number, poolQuantity: string): string => {
  const { decimals } = parseTokenString(poolQuantity);
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return formatNumber(numValue, decimals);
};