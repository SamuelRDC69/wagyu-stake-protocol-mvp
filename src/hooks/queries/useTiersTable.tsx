import { useEffect, useState } from 'react';
import { useWharfKit } from '../useWharfKit';
import { TierTable } from '../../types/tables';
import { CONTRACTS, TABLE_NAMES, getTierScope } from '../../config/contracts';

interface UseTiersTableReturn {
  tiers: TierTable[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTiersTable(): UseTiersTableReturn {
  const { session } = useWharfKit();
  const [tiers, setTiers] = useState<TierTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTiers = async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      const response = await session.client.v1.chain.get_table_rows({
        code: CONTRACTS.STAKING.toString(),
        scope: getTierScope(),
        table: TABLE_NAMES.TIERS,
        limit: 100,
        type: 'TierTable',
      });

      setTiers(response.rows as TierTable[]);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchTiers();
    }
  }, [session]);

  return { tiers, isLoading, error, refetch: fetchTiers };
}