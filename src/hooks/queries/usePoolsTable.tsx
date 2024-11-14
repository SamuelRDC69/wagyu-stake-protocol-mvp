import { useEffect, useState } from 'react';
import { useWharfKit } from '../useWharfKit';
import { PoolTable, TableResponse } from '../../types/tables';
import { CONTRACTS, TABLE_NAMES, getPoolScope } from '../../config/contracts';

interface UsePoolsTableReturn {
  pools: PoolTable[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePoolsTable(): UsePoolsTableReturn {
  const { session } = useWharfKit();
  const [pools, setPools] = useState<PoolTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPools = async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      const response = await session.client.v1.chain.get_table_rows({
        code: CONTRACTS.STAKING.toString(),
        scope: getPoolScope(),
        table: TABLE_NAMES.POOLS,
        limit: 100,
        type: 'PoolTable',
      });

      setPools(response.rows as PoolTable[]);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchPools();
      // Poll every 6 seconds for updates
      const interval = setInterval(fetchPools, 6000);
      return () => clearInterval(interval);
    }
  }, [session]);

  return { pools, isLoading, error, refetch: fetchPools };
}