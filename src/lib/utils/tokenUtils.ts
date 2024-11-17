export const parseTokenString = (tokenString: string | undefined) => {
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
    const amount = parseFloat(amountStr) || 0;
    const decimals = 8;

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
  decimals = 8
): string => {
  if (amount === undefined || isNaN(amount)) {
    return `0.${'0'.repeat(decimals)} ${symbol}`;
  }
  return `${amount.toFixed(decimals)} ${symbol}`;
};