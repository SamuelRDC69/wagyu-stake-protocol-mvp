import { useState, useContext } from 'react';
import { ContractKit } from '@wharfkit/contract';
import { Name } from '@wharfkit/session';
import { WharfkitContext } from '../wharfkit/context';
import { CONTRACTS } from '../wharfkit/contracts';
import { PoolEntity } from '../types/pool';
import { StakedEntity } from '../types/staked';
import { TierEntity } from '../types/tier';
import { ConfigEntity } from '../types/config';

interface RawStakeData {
  pool_id: { value: string };
  staked_quantity: { quantity: string };
  tier: { value: string };
  last_claimed_at: string;
  cooldown_end_at: string;
}

interface TableScope {
  code: string;
  scope: { value: string };
  table: string;
  payer: string;
  count: number;
}

export function useContractData() {
  const { session } = useContext(WharfkitContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!session) {
      console.log('No session available');
      return null;
    }
    
    setLoading(true);
    
    try {
      console.log('Creating ContractKit instance...');
      const contractKit = new ContractKit({
        client: session.client
      });
      
      console.log('Loading contract:', CONTRACTS.STAKING.NAME);
      const contract = await contractKit.load(CONTRACTS.STAKING.NAME);
      
      console.log('Getting table instances...');
      const poolsTable = contract.table(CONTRACTS.STAKING.TABLES.POOLS);
      const tiersTable = contract.table(CONTRACTS.STAKING.TABLES.TIERS);
      const configTable = contract.table(CONTRACTS.STAKING.TABLES.CONFIG);
      const stakesTable = contract.table(CONTRACTS.STAKING.TABLES.STAKEDS);
      
      console.log('Fetching scopes...');
      const scopesCursor = await stakesTable.scopes();
      const scopes = await scopesCursor.all();
      console.log('All scopes:', scopes);

      const [poolsData, tiersData, configData] = await Promise.all([
        poolsTable.all(),
        tiersTable.all(),
        configTable.get()
      ]);
      
      console.log('Fetching stakes for each scope...');
      const allStakesPromises = scopes.map(async (scope: TableScope) => {
        try {
          const scopeName = scope.scope.value;
          console.log('Fetching stakes for scope:', scopeName);
          const userStakesTable = contract.table(CONTRACTS.STAKING.TABLES.STAKEDS, scopeName);
          const userStakes = await userStakesTable.get();
          
          return userStakes.map((stake: RawStakeData): StakedEntity => ({
            pool_id: Number(stake.pool_id.value) || 0,
            staked_quantity: stake.staked_quantity.quantity,
            tier: stake.tier.value,
            last_claimed_at: stake.last_claimed_at,
            cooldown_end_at: stake.cooldown_end_at,
            owner: scopeName
          }));
        } catch (scopeError) {
          console.error('Error fetching stakes for scope:', scopeError);
          return [];
        }
      });

      const allStakesArrays = await Promise.all(allStakesPromises);
      const allStakes = allStakesArrays.flat();
      console.log('All stakes:', allStakes);

      // Transform pools data
      const pools: PoolEntity[] = poolsData.map(pool => ({
        pool_id: Number(pool.pool_id?.value) || 0,
        staked_token_contract: pool.staked_token_contract?.toString() || '',
        total_staked_quantity: pool.total_staked_quantity?.quantity || '0.00000000 WAX',
        total_staked_weight: pool.total_staked_weight?.quantity || '0.00000000 WAX',
        reward_pool: {
          quantity: pool.reward_pool?.quantity?.toString() || '0.00000000 WAX',
          contract: pool.reward_pool?.contract?.toString() || ''
        },
        emission_unit: Number(pool.emission_unit?.toString() || 0),
        emission_rate: Number(pool.emission_rate?.toString() || 0),
        last_emission_updated_at: pool.last_emission_updated_at?.toString() || new Date().toISOString(),
        is_active: Number(pool.is_active ? 1 : 0)
      }));

      // Transform tiers data
      const tiers: TierEntity[] = tiersData.map(tier => ({
        tier: tier.tier?.value || '',
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

      const result = {
        pools,
        stakes: allStakes,
        tiers,
        config
      };

      console.log('Final transformed data:', result);
      return result;

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      } else {
        console.error('Unknown error:', error);
      }
      setError(error instanceof Error ? error : new Error('An unknown error occurred'));
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