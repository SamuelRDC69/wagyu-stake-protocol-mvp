import { useMemo } from 'react';
import { TierEntity, TierProgress } from '../types/tier';
import { StakedEntity } from '../types/staked';
import { PoolEntity } from '../types/pool';
import { parseTokenString } from '../utils/tokenUtils';
import { calculateTierProgress, determineTier } from '../utils/tierUtils';

export function useTierCalculation(
  stakedData: StakedEntity | undefined,
  poolData: PoolEntity | undefined,
  tiers: TierEntity[]
): TierProgress | null {
  return useMemo(() => {
    if (!stakedData || !poolData || !tiers.length) {
      return null;
    }

    try {
      // Get tier calculation based on accurate data
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