import { useMemo } from 'react';
import { TierEntity, TierProgress } from '../types/tier';
import { StakedEntity } from '../types/staked';
import { PoolEntity } from '../types/pool';
import { calculateTierProgress } from '../utils/tierUtils';

export function useTierCalculation(
  stakedData: StakedEntity | undefined,
  poolData: PoolEntity | undefined,
  tiers: TierEntity[]
) {
  return useMemo(() => {
    if (!stakedData || !poolData || !tiers.length) {
      return null;
    }

    try {
      return calculateTierProgress(
        stakedData.staked_quantity,
        poolData.total_staked_quantity,
        tiers
      );
    } catch (error) {
      console.error('Error in useTierCalculation:', error);
      return null;
    }
  }, [stakedData, poolData, tiers]);
}