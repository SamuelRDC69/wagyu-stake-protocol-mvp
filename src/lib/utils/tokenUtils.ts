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
    
    // Detect decimals from the token string
    let decimals = 8; // Default for WAX and most tokens
    
    if (symbol === 'REK') {
      decimals = 4;
    }

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
  decimals?: number
): string => {
  if (amount === undefined || isNaN(amount)) {
    return `0.00000000 ${symbol}`;
  }
  
  // Determine decimals based on symbol
  let tokenDecimals = 8;
  if (symbol === 'REK') {
    tokenDecimals = 4;
  }
  
  // Override with provided decimals if any
  if (decimals !== undefined) {
    tokenDecimals = decimals;
  }
  
  return `${amount.toFixed(tokenDecimals)} ${symbol}`;
};
