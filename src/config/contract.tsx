import { Chain } from '@wharfkit/session'

export const CONTRACT_ACCOUNT = 'token.stake' // This should be updated to actual deployed contract account
export const WAX_CHAIN: Chain = {
    id: '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4',
    url: 'https://wax.greymass.com',
}

export const CONTRACT_TABLES = {
    CONFIG: 'config',
    POOLS: 'pools',
    TIERS: 'tiers',
    STAKEDS: 'stakeds',
    SEQMGR: 'seqmgr'
} as const

export const CONTRACT_ACTIONS = {
    STAKE: 'stake',
    UNSTAKE: 'unstake',
    CLAIM: 'claim',
    SETCONFIG: 'setconfig',
    MAINTENANCE: 'maintenance',
    SETTIER: 'settier',
    SETPOOL: 'setpool',
    SETPOOLACT: 'setpoolact'
} as const

// Table row structure matching smart contract
export const TABLE_SCOPES = {
    [CONTRACT_TABLES.CONFIG]: CONTRACT_ACCOUNT,
    [CONTRACT_TABLES.POOLS]: CONTRACT_ACCOUNT,
    [CONTRACT_TABLES.TIERS]: CONTRACT_ACCOUNT,
    [CONTRACT_TABLES.STAKEDS]: 'owner', // Will be replaced with actual owner
    [CONTRACT_TABLES.SEQMGR]: CONTRACT_ACCOUNT
}

export const DEFAULT_TOKEN_PRECISION = 4
export const DEFAULT_TOKEN_SYMBOL = 'WAX'

// Error messages matching contract throws
export const ERROR_MESSAGES = {
    MAINTENANCE: 'maintenance mode',
    COOLDOWN: 'cooldown period is not over yet.',
    NO_STAKE: 'staked does not exist',
    INVALID_POOL: 'pool does not exist',
    INVALID_QUANTITY: 'quantity must be positive'
} as const