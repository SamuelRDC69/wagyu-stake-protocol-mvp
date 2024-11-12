import { useState } from 'react'
import { Session } from '@wharfkit/session'
import { CONTRACT_ACCOUNT } from '../config/contract'
import { ConfigData, TierEntity, PoolEntity } from '../config/types' // Changed imports

export const useContract = (session: Session | null) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTransaction = async (action: string, data: any) => {
    if (!session) throw new Error('No session available')
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await session.transact({
        action: {
          account: CONTRACT_ACCOUNT,
          name: action,
          authorization: [session.permissionLevel],
          data: data
        }
      })
      return result
    } catch (e) {
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
    setConfig: async (cooldown: number, vault: string) => 
      handleTransaction('setconfig', { cooldown_seconds_per_claim: cooldown, vault_account: vault }),
    
    setMaintenance: async (enabled: boolean) => 
      handleTransaction('maintenance', { maintenance: enabled }),
    
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
    
    // Pool Management
    setPool: async (data: Omit<PoolEntity, 'pool_id' | 'is_active'>) =>
      handleTransaction('setpool', data),
    
    setPoolActive: async (poolId: number, isActive: boolean) =>
      handleTransaction('setpoolact', { pool_id: poolId, is_active: isActive }),
    
    removePool: async (poolId: number) =>
      handleTransaction('removepool', { pool_id: poolId })
  }

  // Add destructcfg action
  destructConfig: async () => 
    handleTransaction('destructcfg', {}),

  // Add setpweight action
  setPoolWeight: async (pool_id: number, total_staked_weight: string) =>
    handleTransaction('setpweight', { 
      pool_id, 
      total_staked_weight 
    }),

  // Queries
  const queries = {
    getConfig: async (): Promise<ConfigData> => {
      const rows = await getTableRows<ConfigData>('config')
      return rows[0]
    },
    
    // Rest remains the same
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