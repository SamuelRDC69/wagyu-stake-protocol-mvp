export const parseTokenString = (tokenString: string | undefined) => {
  if (!tokenString) {
    return {
      amount: 0,
      symbol: '',
      formatted: '0.00000000',
      decimals: 8
    };
  }

  try {
    const parts = tokenString.trim().split(' ');
    const amountStr = parts[0] || '0';
    const symbol = parts[1] || '';
    const amount = parseFloat(amountStr) || 0;
    
    // Detect decimals from the amount string
    const decimals = amountStr.includes('.') ? 
      amountStr.split('.')[1].length : 
      // If no decimal in string, detect from symbol format
      (amountStr.match(/0+$/)?.[0]?.length || 8);

    return {
      amount,
      symbol,
      formatted: `${amount.toFixed(decimals)} ${symbol}`,
      decimals
    };
  } catch {
    return {
      amount: 0,
      symbol: '',
      formatted: '0.00000000',
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
