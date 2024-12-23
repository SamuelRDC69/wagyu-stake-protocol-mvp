import { useState } from 'react'
import { Session } from '@wharfkit/session'
import { CONTRACT_ACCOUNT } from '../config/contract'
import { ConfigData, TierEntity, PoolEntity } from '../config/types'

export const useContract = (session: Session | null) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTransaction = async (action: string, data: any) => {
  if (!session) throw new Error('No session available')
  
  setLoading(true)
  setError(null)
  
  try {
    console.log('Sending transaction:', { action, data });
    const result = await session.transact({
      action: {
        account: CONTRACT_ACCOUNT,
        name: action,
        authorization: [session.permissionLevel],
        data: data
      }
    })
    console.log('Transaction result:', result);
    return result
  } catch (e) {
    console.error('Transaction error:', e);
    const errorMsg = e instanceof Error ? e.message : 'Transaction failed'
    setError(errorMsg)
    throw new Error(errorMsg)
  } finally {
    setLoading(false)
  }
}

  const getTableRows = async <T>(table: string, scope = CONTRACT_ACCOUNT): Promise<T[]> => {
    if (!session) throw new Error('No session available')
    try {
      const response = await session.client.v1.chain.get_table_rows({
        code: CONTRACT_ACCOUNT,
        scope: scope,
        table: table,
        limit: 100,
        json: true
      })
      return response.rows
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : `Failed to fetch ${table}`
      setError(errorMsg)
      throw new Error(errorMsg)
    }
  }

  // Contract Actions
  const actions = {
    // Config Management
    setConfig: async (
      cooldown: number, 
      vault: string, 
      feeVault: string, 
      feeBasisPoints: number
    ) => 
      handleTransaction('setconfig', { 
        cooldown_seconds_per_claim: cooldown, 
        vault_account: vault,
        fee_vault_account: feeVault,
        stake_fee_basis_points: feeBasisPoints
      }),
    
    setMaintenance: async (enabled: boolean) => 
      handleTransaction('maintenance', { maintenance: enabled }),

    destructConfig: async () => 
      handleTransaction('destructcfg', {}),
    
    // Tier Management  
    setTier: async (tier: string, tierName: string, weight: number, stakedUpToPercent: number) =>
      handleTransaction('settier', { 
        tier, 
        tier_name: tierName, 
        weight, 
        staked_up_to_percent: stakedUpToPercent 
      }),
    
    removeTier: async (tier: string) =>
      handleTransaction('removetier', { tier }),
    
setPool: async (data: Omit<PoolEntity, 'pool_id' | 'is_active'>) => {
  // Parse symbol properly
  const [precision, symbolCode] = data.staked_token_symbol.split(',');
  
  return handleTransaction('setpool', {
    staked_token_contract: data.staked_token_contract,
    staked_token_symbol: symbolCode,  // Just send the symbol code
    total_staked_weight: data.total_staked_weight,
    reward_pool: data.reward_pool,
    emission_unit: parseInt(data.emission_unit.toString()),
    emission_rate: parseInt(data.emission_rate.toString()),
    emission_start_at: parseInt(data.emission_start_at),
    emission_end_at: parseInt(data.emission_end_at),
    last_emission_updated_at: parseInt(data.emission_start_at)
  });
},
    
    setPoolActive: async (poolId: number, isActive: boolean) =>
      handleTransaction('setpoolact', { 
        pool_id: poolId, 
        is_active: isActive 
      }),
    
    removePool: async (poolId: number) =>
      handleTransaction('removepool', { 
        pool_id: poolId 
      }),

    setPoolWeight: async (pool_id: number, total_staked_weight: string) =>
      handleTransaction('setpweight', { 
        pool_id, 
        total_staked_weight 
      })
  }

  // Queries
  const queries = {
    getConfig: async (): Promise<ConfigData> => {
      const rows = await getTableRows<ConfigData>('config')
      return rows[0]
    },
    
    getTiers: () => getTableRows<TierEntity>('tiers'),
    
    getPools: () => getTableRows<PoolEntity>('pools'),
    
    getStats: async () => {
      const [config, pools, tiers] = await Promise.all([
        queries.getConfig(),
        queries.getPools(),
        queries.getTiers()
      ])
      
      return {
        config,
        pools,
        tiers,
        totalStaked: pools.reduce((acc, pool) => {
          const [amount] = pool.total_staked_quantity.split(' ')
          return acc + parseFloat(amount)
        }, 0),
        totalRewards: pools.reduce((acc, pool) => {
          const [amount] = pool.reward_pool.quantity.split(' ')
          return acc + parseFloat(amount)
        }, 0)
      }
    }
  }

  return {
    loading,
    error,
    actions,
    queries
  }
}
