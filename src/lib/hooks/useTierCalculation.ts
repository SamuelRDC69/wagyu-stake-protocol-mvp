import { useMemo } from 'react';
import { TierEntity, TierProgress } from '../types/tier';
import { StakedEntity } from '../types/staked';
import { PoolEntity } from '../types/pool';
import { parseTokenString } from '../utils/tokenUtils';
import { calculateTierProgress, determineTier } from '../utils/tierUtils';

/**
 * Hook for calculating tier progress information
 * Provides tier information based on a user's staked amount and pool data
 */
export function useTierCalculation(
  stakedData: StakedEntity | undefined,
  poolData: PoolEntity | undefined,
  tiers: TierEntity[]
): TierProgress | null {
  return useMemo(() => {
    if (!stakedData || !poolData || !tiers.length) {
      console.log('Cannot calculate tier: missing required data');
      return null;
    }
    
    try {
      // Perform calculation with fresh data each time
      console.log('Recalculating tier progress with fresh data:', {
        stakedQuantity: stakedData.staked_quantity,
        poolTotal: poolData.total_staked_quantity,
        tier: stakedData.tier
      });
      
      // Get tier calculation based on accurate data
      const progress = calculateTierProgress(
        stakedData.staked_quantity,
        poolData.total_staked_quantity,
        tiers
      );
      
      // Consistency check - ensure current tier matches stake data
      if (progress && progress.currentTier.tier !== stakedData.tier) {
        console.warn(`Tier mismatch detected: stakedData.tier=${stakedData.tier}, progress.currentTier.tier=${progress.currentTier.tier}`);
        
        // Override with stakedData.tier for UI consistency
        // This handles cases where the backend has already upgraded the tier
        const correctTier = tiers.find(t => t.tier === stakedData.tier);
        if (correctTier) {
          console.log(`Using tier from stakedData: ${stakedData.tier} instead of calculated tier: ${progress.currentTier.tier}`);
          
          // Recalculate tier progress with the enforced tier
          const sortedTiers = [...tiers].sort((a, b) => 
            parseFloat(a.staked_up_to_percent) - parseFloat(b.staked_up_to_percent)
          );
          
          const currentTierIndex = sortedTiers.findIndex(t => t.tier === stakedData.tier);
          
          if (currentTierIndex !== -1) {
            // Adjust next tier based on enforced current tier
            const nextTierIndex = currentTierIndex + 1;
            const nextTier = nextTierIndex < sortedTiers.length 
              ? sortedTiers[nextTierIndex] 
              : undefined;
              
            // Adjust previous tier based on enforced current tier
            const prevTierIndex = currentTierIndex - 1;
            const prevTier = prevTierIndex >= 0 
              ? sortedTiers[prevTierIndex] 
              : undefined;
            
            return {
              ...progress,
              currentTier: correctTier,
              nextTier,
              prevTier
            };
          }
        }
      }
      
      return progress;
    } catch (error) {
      console.error('Error in useTierCalculation:', error);
      return null;
    }
  }, [
    stakedData?.staked_quantity, 
    stakedData?.tier,
    poolData?.total_staked_quantity,
    poolData?.pool_id,
    tiers
  ]); // Add more explicit dependencies for better memoization
}