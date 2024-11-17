export const parseTokenString = (tokenString: string | undefined) => {
  try {
    console.log('Parsing token string:', tokenString);
    
    // Return default for undefined/null
    if (!tokenString) {
      console.log('Token string is empty, returning default');
      return {
        amount: 0,
        symbol: 'WAX',
        formatted: '0.00000000 WAX',
        decimals: 8
      };
    }

    // Ensure string type and trim
    const cleanString = String(tokenString).trim();
    console.log('Cleaned token string:', cleanString);

    // Split and validate parts
    const parts = cleanString.split(' ');
    if (parts.length !== 2) {
      console.log('Invalid token string format');
      return {
        amount: 0,
        symbol: 'WAX',
        formatted: '0.00000000 WAX',
        decimals: 8
      };
    }

    const [amountStr, symbol] = parts;
    
    // Parse amount with additional safety
    let amount = 0;
    try {
      amount = Number(amountStr);
      if (!Number.isFinite(amount)) {
        throw new Error('Amount is not a finite number');
      }
    } catch (e) {
      console.error('Error parsing amount:', e);
      amount = 0;
    }

    const decimals = (amountStr.split('.')[1] || '').length || 8;

    const result = {
      amount,
      symbol: symbol || 'WAX',
      formatted: `${amount.toFixed(decimals)} ${symbol || 'WAX'}`,
      decimals
    };

    console.log('Parsed token result:', result);
    return result;
  } catch (error) {
    console.error('Fatal error parsing token string:', error);
    return {
      amount: 0,
      symbol: 'WAX',
      formatted: '0.00000000 WAX',
      decimals: 8
    };
  }
};