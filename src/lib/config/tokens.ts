export interface TokenConfig {
  symbol: string;
  contract: string;
  image: string;
  name: string;
  decimals: number;
}

// Token configurations
export const TOKENS: { [key: string]: TokenConfig } = {
  WAX: {
    symbol: 'WAX',
    contract: 'eosio.token',
    image: '/wax-waxp-seeklogo.svg',
    name: 'WAXP',
    decimals: 8,
  },
  // Add more tokens here as needed
};

export const getTokenConfig = (symbol: string): TokenConfig | undefined => {
  return TOKENS[symbol.toUpperCase()];
};

export const TokenImage: React.FC<{ 
  symbol: string; 
  className?: string;
  size?: number;
}> = ({ symbol, className, size = 24 }) => {
  const config = getTokenConfig(symbol);
  
  if (!config) {
    return <div className={className}>{symbol}</div>;
  }

  return (
    <img 
      src={config.image} 
      alt={`${config.name} token`} 
      className={className}
      width={size}
      height={size}
    />
  );
};