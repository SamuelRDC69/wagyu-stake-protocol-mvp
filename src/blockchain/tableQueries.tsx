import RpcService from './rpcService'
import { CONTRACT_ACCOUNT } from '../config/contract'
import { PoolEntity, StakedEntity, TierEntity, ConfigRow } from '../types'

export const fetchTableData = {
    getConfig: async (): Promise<ConfigRow | null> => {
        try {
            const response = await RpcService.fetchTableRows<ConfigRow>({
                code: CONTRACT_ACCOUNT,
                scope: CONTRACT_ACCOUNT,
                table: 'config',
                limit: 1
            })
            return response.rows[0] || null
        } catch (error) {
            console.error('Error fetching config:', error)
            return null
        }
    },

    getPools: async (): Promise<PoolEntity[]> => {
        try {
            const response = await RpcService.fetchTableRows<PoolEntity>({
                code: CONTRACT_ACCOUNT,
                scope: CONTRACT_ACCOUNT,
                table: 'pools',
                limit: 100
            })
            return response.rows
        } catch (error) {
            console.error('Error fetching pools:', error)
            return []
        }
    },

    getPoolBySymbol: async (tokenContract: string, symbol: string): Promise<PoolEntity | null> => {
        try {
            // Using the secondary index for tokensym
            const response = await RpcService.fetchTableRows<PoolEntity>({
                code: CONTRACT_ACCOUNT,
                scope: CONTRACT_ACCOUNT,
                table: 'pools',
                limit: 1,
                index_position: 2,
                key_type: 'i128',
                lower_bound: `${tokenContract}:${symbol}`,
                upper_bound: `${tokenContract}:${symbol}`
            })
            return response.rows[0] || null
        } catch (error) {
            console.error('Error fetching pool by symbol:', error)
            return null
        }
    },

    getTiers: async (): Promise<TierEntity[]> => {
        try {
            const response = await RpcService.fetchTableRows<TierEntity>({
                code: CONTRACT_ACCOUNT,
                scope: CONTRACT_ACCOUNT,
                table: 'tiers',
                limit: 100
            })
            return response.rows
        } catch (error) {
            console.error('Error fetching tiers:', error)
            return []
        }
    },

    getUserStakes: async (account: string): Promise<StakedEntity[]> => {
        try {
            const response = await RpcService.fetchTableRows<StakedEntity>({
                code: CONTRACT_ACCOUNT,
                scope: account,
                table: 'stakeds',
                limit: 100
            })
            return response.rows
        } catch (error) {
            console.error('Error fetching user stakes:', error)
            return []
        }
    }
}