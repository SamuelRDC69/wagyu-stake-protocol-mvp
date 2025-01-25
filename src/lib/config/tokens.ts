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