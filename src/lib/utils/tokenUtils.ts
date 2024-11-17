export const parseTokenString = (tokenString: string | undefined) => {
  try {
    if (!tokenString || typeof tokenString !== 'string') {
      return {
        amount: 0,
        symbol: 'WAX',
        formatted: '0.00000000 WAX',
        decimals: 8
      };
    }
    
    const [amountStr, symbol] = tokenString.trim().split(' ');
    if (!amountStr || !symbol) {
      return {
        amount: 0,
        symbol: 'WAX',
        formatted: '0.00000000 WAX',
        decimals: 8
      };
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount)) {
      return {
        amount: 0,
        symbol: symbol || 'WAX',
        formatted: `0.00000000 ${symbol || 'WAX'}`,
        decimals: 8
      };
    }

    const decimals = amountStr.split('.')[1]?.length || 8;
    return {
      amount,
      symbol,
      formatted: tokenString,
      decimals
    };
  } catch (error) {
    console.error('Error parsing token string:', error, 'Input:', tokenString);
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
  try {
    if (amount === undefined || isNaN(amount)) {
      return `0.${'0'.repeat(decimals)} ${symbol}`;
    }
    
    // Ensure amount is a finite number
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    return `${safeAmount.toFixed(decimals)} ${symbol}`;
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return `0.${'0'.repeat(decimals)} ${symbol}`;
  }
};