export const parseTokenString = (tokenString: string | undefined) => {
  try {
    if (!tokenString) throw new Error('No token string provided');
    
    const [amountStr, symbol] = tokenString.split(' ');
    if (!amountStr || !symbol) throw new Error('Invalid token string format');

    return {
      amount: parseFloat(amountStr),
      symbol,
      formatted: tokenString,
      decimals: amountStr.split('.')[1]?.length || 8
    };
  } catch (error) {
    console.error('Error parsing token string:', error);
    return {
      amount: 0,
      symbol: 'WAX',
      formatted: '0.00000000 WAX',
      decimals: 8
    };
  }
};

export const formatTokenAmount = (amount: number | undefined, symbol: string, decimals: number = 8): string => {
  try {
    if (amount === undefined || isNaN(amount)) return `0.${'0'.repeat(decimals)} ${symbol}`;
    return `${amount.toFixed(decimals)} ${symbol}`;
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return `0.${'0'.repeat(decimals)} ${symbol}`;
  }
};