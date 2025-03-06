export interface TokenInfo {
  amount: number;
  symbol: string;
  formatted: string;
  decimals: number;
}

export const detectDecimals = (amount: string): number => {
  const parts = amount.split('.');
  if (parts.length < 2) return 0;
  return parts[1].length;
};

export const parseTokenString = (tokenString: string | undefined): TokenInfo => {
  if (!tokenString) {
    return {
      amount: 0,
      symbol: 'WAX',
      formatted: '0.00000000 WAX',
      decimals: 8
    };
  }

  try {
    const parts = tokenString.trim().split(' ');
    const amountStr = parts[0] || '0';
    const symbol = parts[1] || 'WAX';
    
    // Determine decimals from the amount format
    const decimals = detectDecimals(amountStr);
    const amount = parseFloat(amountStr) || 0;

    return {
      amount,
      symbol,
      formatted: `${amount.toFixed(decimals)} ${symbol}`,
      decimals
    };
  } catch {
    return {
      amount: 0,
      symbol: 'WAX',
      formatted: '0.00000000 WAX',
      decimals: 8
    };
  }
};

export const formatTokenAmount = (
  amount: number | undefined,
  symbol: string,
  decimals: number = 8
): string => {
  if (amount === undefined || isNaN(amount)) {
    return `0.${'0'.repeat(decimals)} ${symbol}`;
  }
  return `${amount.toFixed(decimals)} ${symbol}`;
};