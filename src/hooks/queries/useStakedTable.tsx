import { useEffect, useState } from 'react';
import { useWharfKit } from '../useWharfKit';
import { StakedTable } from '../../types/tables';
import { CONTRACTS, TABLE_NAMES, getStakedScope } from '../../config/contracts';

interface UseStakedTableReturn {
  stakedPositions: StakedTable[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useStakedTable(): UseStakedTableReturn {
  const { session } = useWharfKit();
  const [stakedPositions, setStakedPositions] = useState<StakedTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStakedPositions = async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      const response = await session.client.v1.chain.get_table_rows({
        code: CONTRACTS.STAKING.toString(),
        scope: getStakedScope(session.actor),
        table: TABLE_NAMES.STAKEDS,
        limit: 100,
        type: 'StakedTable',
      });

      setStakedPositions(response.rows as StakedTable[]);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchStakedPositions();
      // Poll every 6 seconds for updates
      const interval = setInterval(fetchStakedPositions, 6000);
      return () => clearInterval(interval);
    }
  }, [session]);

  return { stakedPositions, isLoading, error, refetch: fetchStakedPositions };
}