import { useState } from 'react';
import { useWharfKit } from '../useWharfKit';
import { CONTRACTS } from '../../config/contracts';
import { notifications } from '@mantine/notifications';
import { useStakedTable } from '../queries/useStakedTable';

interface UseClaimReturn {
  claim: (poolId: number) => Promise<void>;
  canClaim: (poolId: number) => boolean;
  timeUntilClaim: (poolId: number) => number | null;
  isProcessing: boolean;
  error: Error | null;
}

export function useClaim(): UseClaimReturn {
  const { session } = useWharfKit();
  const { stakedPositions } = useStakedTable();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const canClaim = (poolId: number): boolean => {
    if (!stakedPositions) return false;
    
    const position = stakedPositions.find(p => p.pool_id === poolId);
    if (!position) return false;

    const now = new Date().getTime();
    const cooldownEnd = new Date(position.cooldown_end_at).getTime();
    
    return now > cooldownEnd;
  };

  const timeUntilClaim = (poolId: number): number | null => {
    if (!stakedPositions) return null;
    
    const position = stakedPositions.find(p => p.pool_id === poolId);
    if (!position) return null;

    const now = new Date().getTime();
    const cooldownEnd = new Date(position.cooldown_end_at).getTime();
    
    return Math.max(0, cooldownEnd - now);
  };

  const claim = async (poolId: number) => {
    if (!session) {
      throw new Error('Session required');
    }

    if (!canClaim(poolId)) {
      throw new Error('Cooldown period not finished');
    }

    setIsProcessing(true);
    setError(null);

    try {
      const action = {
        account: CONTRACTS.STAKING,
        name: 'claim',
        authorization: [session.permissionLevel],
        data: {
          claimer: session.actor,
          pool_id: poolId
        }
      };

      const response = await session.transact({ action });
      
      notifications.show({
        title: 'Claim Successful',
        message: 'Successfully claimed rewards',
        color: 'green'
      });

      return response;
    } catch (e) {
      const error = e as Error;
      setError(error);
      notifications.show({
        title: 'Claim Failed',
        message: error.message,
        color: 'red'
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return { claim, canClaim, timeUntilClaim, isProcessing, error };
}