import { useState } from 'react';
import { Asset, Name } from '@wharfkit/session';
import { useWharfKit } from '../useWharfKit';
import { CONTRACTS, STAKE_MEMO } from '../../config/contracts';
import { notifications } from '@mantine/notifications';
import { PoolTable } from '../../types/tables';

interface UseStakeTokenReturn {
  stake: (amount: string, pool: PoolTable) => Promise<void>;
  isProcessing: boolean;
  error: Error | null;
}

export function useStakeToken(): UseStakeTokenReturn {
  const { session } = useWharfKit();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const stake = async (amount: string, pool: PoolTable) => {
    if (!session) {
      throw new Error('Session required');
    }

    setIsProcessing(true);
    setError(null);

    try {
      const action = {
        account: pool.staked_token_contract,
        name: 'transfer',
        authorization: [session.permissionLevel],
        data: {
          from: session.actor,
          to: CONTRACTS.STAKING,
          quantity: amount,
          memo: STAKE_MEMO
        }
      };

      const response = await session.transact({ action });
      
      notifications.show({
        title: 'Stake Successful',
        message: `Successfully staked ${amount} to ${pool.staked_token_contract}`,
        color: 'green'
      });

      return response;
    } catch (e) {
      const error = e as Error;
      setError(error);
      notifications.show({
        title: 'Stake Failed',
        message: error.message,
        color: 'red'
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return { stake, isProcessing, error };
}