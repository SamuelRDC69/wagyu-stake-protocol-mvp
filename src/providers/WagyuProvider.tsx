import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useWharfKit } from '../hooks/useWharfKit';
import { usePoolsTable } from '../hooks/queries/usePoolsTable';
import { useTiersTable } from '../hooks/queries/useTiersTable';
import { useStakedTable } from '../hooks/queries/useStakedTable';
import { 
  PoolTable, 
  TierTable, 
  StakedTable 
} from '../types/tables';
import { Asset } from '@wharfkit/session';
import { 
  calculateTierWeight,
  calculateEffectiveStake,
  calculateRewards,
  calculateAPR
} from '../utils/calculations';

interface WagyuContextData {
  // Data
  pools: PoolTable[];
  tiers: TierTable[];
  userStakes: StakedTable[];
  selectedPool: PoolTable | null;
  
  // Loading States
  isLoading: boolean;
  isPoolsLoading: boolean;
  isTiersLoading: boolean;
  isStakesLoading: boolean;

  // Errors
  error: Error | null;
  
  // Actions
  selectPool: (poolId: number) => void;
  refreshData: () => Promise<void>;

  // Calculations
  getUserTier: (poolId: number) => TierTable | null;
  getEffectiveStake: (poolId: number) => Asset | null;
  getEstimatedRewards: (poolId: number) => Asset | null;
  getPoolAPR: (poolId: number) => number;
}

const WagyuContext = createContext<WagyuContextData | undefined>(undefined);

export function WagyuProvider({ children }: { children: ReactNode }) {
  const { session } = useWharfKit();
  const { pools, isLoading: isPoolsLoading, refetch: refetchPools } = usePoolsTable();
  const { tiers, isLoading: isTiersLoading, refetch: refetchTiers } = useTiersTable();
  const { stakedPositions, isLoading: isStakesLoading, refetch: refetchStakes } = useStakedTable();
  
  const [selectedPool, setSelectedPool] = useState<PoolTable | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const refreshData = async () => {
    try {
      await Promise.all([
        refetchPools(),
        refetchTiers(),
        refetchStakes()
      ]);
    } catch (e) {
      setError(e as Error);
    }
  };

  const selectPool = (poolId: number) => {
    const pool = pools.find(p => p.pool_id === poolId);
    setSelectedPool(pool || null);
  };

  const getUserTier = (poolId: number): TierTable | null => {
    const stake = stakedPositions.find(s => s.pool_id === poolId);
    const pool = pools.find(p => p.pool_id === poolId);
    
    if (!stake || !pool) return null;

    return calculateTierWeight(
      stake.staked_quantity,
      pool.total_staked_quantity,
      tiers
    );
  };

  const getEffectiveStake = (poolId: number): Asset | null => {
    const stake = stakedPositions.find(s => s.pool_id === poolId);
    const tier = getUserTier(poolId);
    
    if (!stake || !tier) return null;

    return calculateEffectiveStake(stake.staked_quantity, tier.weight);
  };

  const getEstimatedRewards = (poolId: number): Asset | null => {
    const stake = stakedPositions.find(s => s.pool_id === poolId);
    const pool = pools.find(p => p.pool_id === poolId);
    const tier = getUserTier(poolId);
    
    if (!stake || !pool || !tier) return null;

    const timeSinceLastClaim = Date.now() - new Date(stake.last_claimed_at).getTime();
    return calculateRewards(stake.staked_quantity, tier.weight, pool, timeSinceLastClaim);
  };

  const getPoolAPR = (poolId: number): number => {
    const pool = pools.find(p => p.pool_id === poolId);
    const tier = getUserTier(poolId);
    
    if (!pool || !tier) return 0;

    return calculateAPR(pool, tier.weight);
  };

  return (
    <WagyuContext.Provider
      value={{
        // Data
        pools,
        tiers,
        userStakes: stakedPositions,
        selectedPool,
        
        // Loading States
        isLoading: isPoolsLoading || isTiersLoading || isStakesLoading,
        isPoolsLoading,
        isTiersLoading,
        isStakesLoading,
        
        // Error
        error,
        
        // Actions
        selectPool,
        refreshData,
        
        // Calculations
        getUserTier,
        getEffectiveStake,
        getEstimatedRewards,
        getPoolAPR,
      }}
    >
      {children}
    </WagyuContext.Provider>
  );
}

export const useWagyu = () => {
  const context = useContext(WagyuContext);
  if (context === undefined) {
    throw new Error('useWagyu must be used within a WagyuProvider');
  }
  return context;
};