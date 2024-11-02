import { SessionKit, Session, Chains } from '@wharfkit/session'
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor'
import WebRenderer from '@wharfkit/web-renderer'
import { CONTRACT_ACCOUNT, WAX_CHAIN } from '../config/contract'
import { Asset, Name, NameType, ActionType, TimePoint } from '@wharfkit/session'
import { 
    PoolEntity, 
    StakedEntity, 
    TierEntity, 
    ConfigRow 
} from '../types'

class WharfKitService {
    private static instance: WharfKitService
    private sessionKit: SessionKit
    private currentSession: Session | undefined

    private constructor() {
        this.sessionKit = new SessionKit({
            appName: 'Stakeland: Kingdom of Rewards',
            chains: [WAX_CHAIN],
            ui: new WebRenderer(),
            walletPlugins: [
                new WalletPluginAnchor(),
            ],
        })
    }

    public static getInstance(): WharfKitService {
        if (!WharfKitService.instance) {
            WharfKitService.instance = new WharfKitService()
        }
        return WharfKitService.instance
    }

    async init(): Promise<void> {
        const restored = await this.sessionKit.restore()
        if (restored) {
            this.currentSession = restored
        }
    }

    async login(): Promise<void> {
        const response = await this.sessionKit.login()
        this.currentSession = response.session
    }

    async logout(): Promise<void> {
        if (this.currentSession) {
            await this.sessionKit.logout(this.currentSession)
            this.currentSession = undefined
        }
    }

    getSession(): Session | undefined {
        return this.currentSession
    }

    async getConfig(): Promise<ConfigRow | null> {
        if (!this.currentSession) return null
        
        try {
            const response = await this.currentSession.client.v1.chain.get_table_rows({
                code: CONTRACT_ACCOUNT,
                scope: CONTRACT_ACCOUNT,
                table: 'config',
                limit: 1
            })
            
            return response.rows[0] as ConfigRow
        } catch (error) {
            console.error('Error fetching config:', error)
            return null
        }
    }

    async getPools(): Promise<PoolEntity[]> {
        if (!this.currentSession) return []
        
        try {
            const response = await this.currentSession.client.v1.chain.get_table_rows({
                code: CONTRACT_ACCOUNT,
                scope: CONTRACT_ACCOUNT,
                table: 'pools',
                limit: 100
            })
            
            return response.rows as PoolEntity[]
        } catch (error) {
            console.error('Error fetching pools:', error)
            return []
        }
    }

    async getUserStakes(account: NameType): Promise<StakedEntity[]> {
        if (!this.currentSession) return []
        
        try {
            const response = await this.currentSession.client.v1.chain.get_table_rows({
                code: CONTRACT_ACCOUNT,
                scope: account,
                table: 'stakeds',
                limit: 100
            })
            
            return response.rows as StakedEntity[]
        } catch (error) {
            console.error('Error fetching user stakes:', error)
            return []
        }
    }

    async getTiers(): Promise<TierEntity[]> {
        if (!this.currentSession) return []
        
        try {
            const response = await this.currentSession.client.v1.chain.get_table_rows({
                code: CONTRACT_ACCOUNT,
                scope: CONTRACT_ACCOUNT,
                table: 'tiers',
                limit: 100
            })
            
            return response.rows as TierEntity[]
        } catch (error) {
            console.error('Error fetching tiers:', error)
            return []
        }
    }

    async stake(amount: Asset): Promise<boolean> {
        if (!this.currentSession) return false
        
        try {
            const action: ActionType = {
                account: 'eosio.token',
                name: 'transfer',
                authorization: [this.currentSession.permissionLevel],
                data: {
                    from: this.currentSession.actor,
                    to: CONTRACT_ACCOUNT,
                    quantity: amount,
                    memo: 'stake'
                }
            }
            
            await this.currentSession.transact({action})
            return true
        } catch (error) {
            console.error('Error staking:', error)
            return false
        }
    }

    async unstake(poolId: number, amount: Asset): Promise<boolean> {
        if (!this.currentSession) return false
        
        try {
            const action: ActionType = {
                account: CONTRACT_ACCOUNT,
                name: 'unstake',
                authorization: [this.currentSession.permissionLevel],
                data: {
                    claimer: this.currentSession.actor,
                    pool_id: poolId,
                    quantity: amount
                }
            }
            
            await this.currentSession.transact({action})
            return true
        } catch (error) {
            console.error('Error unstaking:', error)
            return false
        }
    }

    async claim(poolId: number): Promise<boolean> {
        if (!this.currentSession) return false
        
        try {
            const action: ActionType = {
                account: CONTRACT_ACCOUNT,
                name: 'claim',
                authorization: [this.currentSession.permissionLevel],
                data: {
                    claimer: this.currentSession.actor,
                    pool_id: poolId
                }
            }
            
            await this.currentSession.transact({action})
            return true
        } catch (error) {
            console.error('Error claiming:', error)
            return false
        }
    }

    subscribeToUserStakes(account: Name, callback: (stakes: StakedEntity[]) => void): (() => void) {
        const interval = setInterval(async () => {
            const stakes = await this.getUserStakes(account)
            callback(stakes)
        }, 5000) // Update every 5 seconds
        
        return () => clearInterval(interval)
    }

    subscribeToPools(callback: (pools: PoolEntity[]) => void): (() => void) {
        const interval = setInterval(async () => {
            const pools = await this.getPools()
            callback(pools)
        }, 5000) // Update every 5 seconds
        
        return () => clearInterval(interval)
    }
}

export default WharfKitService.getInstance()