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
    let decimals = 0;
    
    if (amountStr.includes('.')) {
      // If amount has decimal point, count decimal places
      decimals = amountStr.split('.')[1].length;
    } else {
      // If no decimal point, attempt to detect from trailing zeros
      const matchZeros = amountStr.match(/\.?0*$/);
      decimals = matchZeros ? matchZeros[0].length : 0;
    }
    
    // Set minimum decimals to ensure proper formatting
    decimals = Math.max(decimals, 4);
    
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
  decimals?: number
): string => {
  if (amount === undefined || isNaN(amount)) {
    const defaultDecimals = decimals || 8;
    return `0.${'0'.repeat(defaultDecimals)} ${symbol}`;
  }
  
  // Use provided decimals or default to 8
  const tokenDecimals = decimals || 8;
  
  return `${amount.toFixed(tokenDecimals)} ${symbol}`;
};