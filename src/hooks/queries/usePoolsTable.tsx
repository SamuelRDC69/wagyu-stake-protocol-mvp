import { useCallback, useEffect, useRef } from 'react';
import { useWharfKit } from '../useWharfKit';
import { PoolTable } from '../../types/tables';
import { CONTRACTS } from '../../config/contracts';

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

  const fetchPools = useCallback(async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      const response = await session.client.v1.chain.get_table_rows({
        code: CONTRACTS.STAKING.toString(),
        scope: CONTRACTS.STAKING.toString(),
        table: 'pools',
        limit: 100,
        json: true
      });

      setPools(response.rows);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchPools();
      const interval = setInterval(fetchPools, 6000);
      return () => clearInterval(interval);
    }
  }, [fetchPools, session]);

  return { pools, isLoading, error, refetch: fetchPools };
}