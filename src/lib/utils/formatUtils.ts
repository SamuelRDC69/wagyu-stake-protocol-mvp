export const formatNumber = (num: number, decimals: number = 8): string => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatPercent = (num: number): string => {
  return `${num.toFixed(2)}%`;
};

export const formatEmissionRate = (unit: number, rate: number): string => {
  const perHour = (3600 / unit) * rate;
  return formatNumber(perHour);
};

export const shortenAddress = (address: string, chars: number = 4): string => {
  if (!address) return '';
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

export const formatPoolStats = (
  totalStaked: string,
  emissionRate: number,
  emissionUnit: number
): string => {
  const hourlyEmission = formatEmissionRate(emissionUnit, emissionRate);
  return `${formatNumber(parseFloat(totalStaked))} (${hourlyEmission}/hr)`;
};