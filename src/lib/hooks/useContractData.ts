import { useState, useContext } from 'react';
import { ContractKit } from '@wharfkit/contract';
import { Name } from '@wharfkit/session';
import { Serializer, Asset } from '@wharfkit/antelope';
import { WharfkitContext } from '../wharfkit/context';
import { CONTRACTS } from '../wharfkit/contracts';
import { PoolEntity } from '../types/pool';
import { StakedEntity } from '../types/staked';
import { TierEntity } from '../types/tier';
import { ConfigEntity } from '../types/config';

interface RawStakeData {
  pool_id: Name;
  staked_quantity: Asset;
  tier: Name;
  last_claimed_at: string;
  cooldown_end_at: string;
  owner?: string;
}

export function useContractData() {
  const { session } = useContext(WharfkitContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [cachedScopes, setCachedScopes] = useState<any[]>([]);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const fetchData = async (forceRefresh = false) => {
    if (!session) return null;
    
    // Don't fetch if we've fetched within the last 5 seconds unless forced
    const now = Date.now();
    if (!forceRefresh && now - lastFetchTime < 5000) {
      return null;
    }
    
    setLoading(true);
    
    try {
      const contractKit = new ContractKit({
        client: session.client
      });
      
      const contract = await contractKit.load(CONTRACTS.STAKING.NAME);
      
      // Get all table instances
      const poolsTable = contract.table(CONTRACTS.STAKING.TABLES.POOLS);
      const tiersTable = contract.table(CONTRACTS.STAKING.TABLES.TIERS);
      const configTable = contract.table(CONTRACTS.STAKING.TABLES.CONFIG);
      const stakesTable = contract.table(CONTRACTS.STAKING.TABLES.STAKEDS);

      // Only fetch scopes if we don't have them cached
      let scopes = cachedScopes;
      if (!scopes.length || forceRefresh) {
        const scopesCursor = await stakesTable.scopes();
        scopes = await scopesCursor.all();
        setCachedScopes(scopes);
      }

      // Fetch all data in parallel
      const [poolsData, tiersData, configData, ...stakesData] = await Promise.all([
        poolsTable.all(),
        tiersTable.all(),
        configTable.get(),
        ...scopes.map(scope => 
          contract.table(CONTRACTS.STAKING.TABLES.STAKEDS, scope.scope.toString()).all()
        )
      ]);

      // Transform pools data
      const pools: PoolEntity[] = poolsData.map(pool => ({
        pool_id: Number(pool.pool_id.toString()),
        staked_token_contract: pool.staked_token_contract.toString(),
        total_staked_quantity: pool.total_staked_quantity.toString(),
        total_staked_weight: pool.total_staked_weight.toString(),
        reward_pool: {
          quantity: pool.reward_pool.quantity.toString(),
          contract: pool.reward_pool.contract.toString()
        },
        emission_unit: Number(pool.emission_unit),
        emission_rate: Number(pool.emission_rate),
        last_emission_updated_at: pool.last_emission_updated_at.toString(),
        is_active: Number(pool.is_active)
      }));

      // Transform tiers data
      const tiers: TierEntity[] = tiersData.map(tier => ({
        tier: tier.tier.toString(),
        tier_name: tier.tier_name,
        weight: tier.weight.toString(),
        staked_up_to_percent: tier.staked_up_to_percent.toString()
      }));

      // Transform config data
      const config: ConfigEntity = {
        maintenance: Number(configData?.maintenance),
        cooldown_seconds_per_claim: Number(configData?.cooldown_seconds_per_claim),
        vault_account: configData?.vault_account.toString()
      };

      // Flatten and transform stakes data
      const stakes = stakesData.flat();

      console.log('Transformed data:', { pools, stakes, tiers, config });

      setLastFetchTime(now);
      return {
        pools,
        stakes,
        tiers,
        config
      };

    } catch (error: unknown) {
      console.error('Error details:', error);
      setError(error instanceof Error ? error : new Error('An unknown error occurred'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchData,
    loading,
    error,
    forceRefresh: () => fetchData(true)
  };
}