import { Name } from '@wharfkit/session';
import { createContext, useContext } from 'react';
import { TablesContextState } from '../types/tables';

export const CONTRACTS = {
  STAKING: Name.from('wagyu.stake'),
  TOKEN: Name.from('eosio.token'),
} as const;

export const TABLE_NAMES = {
  CONFIG: 'config',
  POOLS: 'pools',
  TIERS: 'tiers',
  STAKEDS: 'stakeds',
} as const;

// Context for contract data
export const TablesContext = createContext<TablesContextState | undefined>(undefined);

export const useTablesContext = () => {
  const context = useContext(TablesContext);
  if (!context) {
    throw new Error('useTablesContext must be used within a TablesProvider');
  }
  return context;
};

// Table scope helpers
export const getStakedScope = (owner: Name) => owner.toString();
export const getPoolScope = () => CONTRACTS.STAKING.toString();
export const getTierScope = () => CONTRACTS.STAKING.toString();

// Action constants
export const STAKE_MEMO = 'stake';

// Table query helpers
export const getTableKey = (poolId: number) => {
  return {
    lower_bound: poolId,
    upper_bound: poolId,
  };
};

export const combineTokenSym = (contract: Name, symCode: string) => {
  return `${contract.toString()}-${symCode}`;
};