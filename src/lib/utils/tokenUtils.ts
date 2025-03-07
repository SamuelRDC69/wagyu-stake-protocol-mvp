export interface TokenInfo {
  amount: number;
  symbol: string;
  formatted: string;
  decimals: number;
}

/**
 * Detects the number of decimal places in a string representation of a number
 */
export const detectDecimals = (amount: string): number => {
  try {
    const parts = amount.split('.');
    if (parts.length < 2) return 0;
    return parts[1].length;
  } catch (error) {
    console.error('Error detecting decimals:', error, amount);
    return 0; // Default to 0 decimals on error
  }
};

/**
 * Parses a token string of format "1.23456789 TOKEN" into its components
 * Dynamically detects the number of decimal places
 */
export const parseTokenString = (tokenString: string | undefined): TokenInfo => {
  if (!tokenString || tokenString.trim() === '') {
    console.warn('Empty token string provided to parseTokenString');
    return {
      amount: 0,
      symbol: '',
      formatted: '0',
      decimals: 0
    };
  }

  try {
    // Clean up and split the token string
    const parts = tokenString.trim().split(' ');
    const amountStr = parts[0] || '0';
    const symbol = parts.length > 1 ? parts[1] : '';
    
    // Determine decimals from the amount format
    const decimals = detectDecimals(amountStr);
    console.log(`Token parsing: "${amountStr} ${symbol}" has ${decimals} decimals`);
    
    const amount = parseFloat(amountStr) || 0;

    return {
      amount,
      symbol,
      formatted: `${amount.toFixed(decimals)} ${symbol}`,
      decimals
    };
  } catch (error) {
    console.error('Error parsing token string:', error, tokenString);
    return {
      amount: 0,
      symbol: '',
      formatted: '0',
      decimals: 0
    };
  }
};

/**
 * Formats a number as a token amount with the specified symbol and decimal places
 */
export const formatTokenAmount = (
  amount: number | undefined,
  symbol: string,
  decimals: number = 0
): string => {
  if (amount === undefined || isNaN(amount)) {
    return `0${decimals > 0 ? '.' + '0'.repeat(decimals) : ''} ${symbol}`;
  }
  return `${amount.toFixed(decimals)} ${symbol}`;
};