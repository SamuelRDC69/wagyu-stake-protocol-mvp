export const CONTRACTS = {
  STAKING: {
    NAME: 'stakingdappp', // Replace with your deployed contract name
    TABLES: {
      POOLS: 'pools',
      STAKEDS: 'stakeds',
      TIERS: 'tiers',
      CONFIG: 'config'
    }
  }
} as const;