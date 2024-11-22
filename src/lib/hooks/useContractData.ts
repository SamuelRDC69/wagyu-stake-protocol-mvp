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
      const tiersTable = contract.table(CONTRACTS.STAKING.TABLES.TIERS);
      const configTable = contract.table(CONTRACTS.STAKING.TABLES.CONFIG);

      // First get all scopes (accounts) that have staked
      const stakesTable = contract.table(CONTRACTS.STAKING.TABLES.STAKEDS);
      const scopesCursor = await stakesTable.scopes();
      const scopes = await scopesCursor.all();

      // Fetch data from all tables
      const [poolsData, tiersData, configData] = await Promise.all([
        poolsTable.all(),
        tiersTable.all(),
        configTable.get()
      ]);

      // Fetch stakes for all users
      const allStakesPromises = scopes.map(async (scope) => {
        const userStakesTable = contract.table(CONTRACTS.STAKING.TABLES.STAKEDS, scope.scope);
        const userStakes = await userStakesTable.get();
        return userStakes.map(stake => ({
          ...stake,
          owner: scope.scope // Add owner field to each stake
        }));
      });

      const allStakesArrays = await Promise.all(allStakesPromises);
      const allStakes = allStakesArrays.flat();

      // Transform pools data
      const pools: PoolEntity[] = poolsData.map(pool => ({
        pool_id: Number(pool.pool_id?.toString() || 0),
        staked_token_contract: pool.staked_token_contract?.toString() || '',
        total_staked_quantity: pool.total_staked_quantity?.toString() || '0.00000000 WAX',
        total_staked_weight: pool.total_staked_weight?.toString() || '0.00000000 WAX',
        reward_pool: {
          quantity: pool.reward_pool?.quantity?.toString() || '0.00000000 WAX',
          contract: pool.reward_pool?.contract?.toString() || ''
        },
        emission_unit: Number(pool.emission_unit?.toString() || 0),
        emission_rate: Number(pool.emission_rate?.toString() || 0),
        last_emission_updated_at: pool.last_emission_updated_at?.toString() || new Date().toISOString(),
        is_active: Number(pool.is_active ? 1 : 0)
      }));

      // Transform stakes data with owner information
      const stakes: StakedEntity[] = allStakes.map(stake => ({
        pool_id: Number(stake.pool_id?.toString() || 0),
        staked_quantity: stake.staked_quantity?.toString() || '0.00000000 WAX',
        tier: stake.tier?.toString() || 'bronze',
        last_claimed_at: stake.last_claimed_at?.toString() || new Date().toISOString(),
        cooldown_end_at: stake.cooldown_end_at?.toString() || new Date().toISOString(),
        owner: stake.owner // Include owner in the transformed data
      }));

      // Transform tiers data
      const tiers: TierEntity[] = tiersData.map(tier => ({
        tier: tier.tier?.toString() || '',
        tier_name: tier.tier_name || '',
        weight: tier.weight?.toString() || '1.0',
        staked_up_to_percent: tier.staked_up_to_percent?.toString() || '0.0'
      }));

      // Transform config data
      const config: ConfigEntity = {
        maintenance: Number(configData?.maintenance ? 1 : 0),
        cooldown_seconds_per_claim: Number(configData?.cooldown_seconds_per_claim?.toString() || 60),
        vault_account: configData?.vault_account?.toString() || ''
      };

      console.log('Transformed data:', { pools, stakes, tiers, config });

      return {
        pools,
        stakes,
        tiers,
        config
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