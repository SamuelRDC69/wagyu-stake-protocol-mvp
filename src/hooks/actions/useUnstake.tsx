import { useState } from 'react';
import { Asset } from '@wharfkit/session';
import { useWharfKit } from '../useWharfKit';
import { CONTRACTS } from '../../config/contracts';
import { notifications } from '@mantine/notifications';

interface UseUnstakeReturn {
  unstake: (poolId: number, amount: string) => Promise<void>;
  isProcessing: boolean;
  error: Error | null;
}

export function useUnstake(): UseUnstakeReturn {
  const { session } = useWharfKit();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const unstake = async (poolId: number, amount: string) => {
    if (!session) {
      throw new Error('Session required');
    }

    setIsProcessing(true);
    setError(null);

    try {
      const action = {
        account: CONTRACTS.STAKING,
        name: 'unstake',
        authorization: [session.permissionLevel],
        data: {
          claimer: session.actor,
          pool_id: poolId,
          quantity: amount
        }
      };

      const response = await session.transact({ action });
      
      notifications.show({
        title: 'Unstake Successful',
        message: `Successfully unstaked ${amount}`,
        color: 'green'
      });

      return response;
    } catch (e) {
      const error = e as Error;
      setError(error);
      notifications.show({
        title: 'Unstake Failed',
        message: error.message,
        color: 'red'
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return { unstake, isProcessing, error };
}