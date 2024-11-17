export const parseTokenString = (tokenString: string) => {
  const [amountStr, symbol] = tokenString.split(' ');
  return {
    amount: parseFloat(amountStr),
    symbol,
    formatted: tokenString,
    decimals: amountStr.split('.')[1]?.length || 8
  };
};

export const formatTokenAmount = (amount: number, symbol: string, decimals: number = 8): string => {
  return `${amount.toFixed(decimals)} ${symbol}`;
};

export const calculateWeight = (amount: number, weight: number): number => {
  return amount * weight;
};

export const formatWithCommas = (tokenString: string): string => {
  const { amount, symbol } = parseTokenString(tokenString);
  return `${amount.toLocaleString(undefined, {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8
  })} ${symbol}`;
};