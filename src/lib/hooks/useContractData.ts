import { ContractKit } from "@wharfkit/contract";
import { useState, useEffect, useCallback, useContext } from 'react';
import { WharfkitContext } from '../wharfkit/context';
import { CONTRACTS } from '../wharfkit/contracts';

export function useContractData() {
  const { session } = useContext(WharfkitContext);
  const [tables, setTables] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (session) {
      const init = async () => {
        try {
          const kit = new ContractKit({ client: session.client });
          const contract = await kit.load(CONTRACTS.STAKING.NAME);
          
          setTables({
            pools: contract.table('pools'),
            stakes: contract.table('stakeds', session.actor),
            tiers: contract.table('tiers'),
            config: contract.table('config')
          });
        } catch (err) {
          setError(err as Error);
        }
      };
      init();
    }
  }, [session]);

  const fetchData = useCallback(async () => {
    if (!tables) return null;
    setLoading(true);
    
    try {
      const [pools, stakes, tiers, config] = await Promise.all([
        tables.pools.all(),
        tables.stakes.all(),
        tables.tiers.all(),
        tables.config.get()
      ]);
      
      setError(null);
      return { pools, stakes, tiers, config };
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [tables]);

  return {
    fetchData,
    loading,
    error
  };
}