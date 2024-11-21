import { useState, useContext } from 'react';
import { ContractKit } from '@wharfkit/contract';
import { WharfkitContext } from '../wharfkit/context';
import { CONTRACTS } from '../wharfkit/contracts';
import { PoolEntity } from '../types/pool';
import { StakedEntity } from '../types/staked';
import { TierEntity } from '../types/tier';
import { ConfigEntity } from '../types/config';

export function useContractData() {
  const { session } = useContext(WharfkitContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!session) return null;
    setLoading(true);
    
    try {
      const contractKit = new ContractKit({
        client: session.client
      });
      
      const contract = await contractKit.load(CONTRACTS.STAKING.NAME);
      
      const poolsTable = contract.table(CONTRACTS.STAKING.TABLES.POOLS);
      const stakesTable = contract.table(CONTRACTS.STAKING.TABLES.STAKEDS, session.actor.toString());
      const tiersTable = contract.table(CONTRACTS.STAKING.TABLES.TIERS);
      const configTable = contract.table(CONTRACTS.STAKING.TABLES.CONFIG);

      const [pools, stakes, tiers, config] = await Promise.all([
        poolsTable.all(),
        stakesTable.all(),
        tiersTable.all(),
        configTable.get()
      ]);

      console.log('Raw data fetched:', { pools, stakes, tiers, config });

      return {
        pools: pools as PoolEntity[],
        stakes: stakes as StakedEntity[],
        tiers: tiers as TierEntity[],
        config: config as ConfigEntity
      };

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchData,
    loading,
    error
  };
}
