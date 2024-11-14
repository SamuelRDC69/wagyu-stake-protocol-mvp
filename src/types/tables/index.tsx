import { Asset, ExtendedAsset, Name, TimePoint } from '@wharfkit/session';
import { ReactNode } from 'react';

// Component Props Type
export interface WagyuComponentProps {
  children?: ReactNode;
  className?: string;
}

// Table Interfaces
export interface ConfigTable {
  maintenance: boolean;
  cooldown_seconds_per_claim: number;
  vault_account: Name;
}

export interface PoolTable {
  pool_id: number;
  staked_token_contract: Name;
  total_staked_quantity: Asset;
  total_staked_weight: Asset;
  reward_pool: ExtendedAsset;
  emission_unit: number;
  emission_rate: number;
  last_emission_updated_at: TimePoint;
  is_active: boolean;
}

export interface TierTable {
  tier: Name;
  tier_name: string;
  weight: number;
  staked_up_to_percent: number;
}

export interface StakedTable {
  pool_id: number;
  staked_quantity: Asset;
  tier: Name;
  last_claimed_at: TimePoint;
  cooldown_end_at: TimePoint;
}

// Table Context Types
export interface TablesContextState {
  pools: PoolTable[];
  tiers: TierTable[];
  config?: ConfigTable;
  isLoading: boolean;
  error?: Error;
}

// Index configurations
export const TABLE_INDEXES = {
  pools: {
    byTokenSym: {
      index_position: 2,
      key_type: 'i128'
    }
  },
  tiers: {
    byStakedUpTo: {
      index_position: 2,
      key_type: 'float64'
    }
  }
} as const;