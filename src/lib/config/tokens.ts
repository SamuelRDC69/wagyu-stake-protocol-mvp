import React from 'react';

export interface TokenConfig {
  symbol: string;
  contract: string;
  image: string;
  name: string;
  decimals: number;
}

export const TOKENS: { [key: string]: TokenConfig } = {
  WAX: {
    symbol: 'WAX',
    contract: 'eosio.token',
    image: '/wax-waxp-seeklogo.svg',
    name: 'WAXP',
    decimals: 8,
  },
};

export const getTokenConfig = (symbol: string): TokenConfig | undefined => {
  return TOKENS[symbol.toUpperCase()];
};

interface TokenImageProps {
  symbol: string;
  className?: string;
  size?: number;
}

export const TokenImage = React.forwardRef<HTMLImageElement, TokenImageProps>(
  ({ symbol, className, size = 24 }, ref) => {
    const config = getTokenConfig(symbol);
    
    if (!config) {
      return <div className={className}>{symbol}</div>;
    }

    return (
      <img 
        ref={ref}
        src={config.image} 
        alt={`${config.name} token`} 
        className={className}
        width={size}
        height={size}
      />
    );
  }
);

TokenImage.displayName = 'TokenImage';