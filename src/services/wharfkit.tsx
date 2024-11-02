import { SessionKit, Session, Asset, ActionType } from '@wharfkit/session'
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor'
import WebRenderer from '@wharfkit/web-renderer'
import { WAX_CHAIN, CONTRACT_ACCOUNT } from '../config/contract'
import { NotificationService } from './'

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
        try {
            const response = await this.sessionKit.login()
            this.currentSession = response.session
        } catch (error) {
            NotificationService.getInstance().error('Login failed', error instanceof Error ? error.message : 'Unknown error')
            throw error
        }
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

    async stake(amount: Asset): Promise<boolean> {
        if (!this.currentSession) throw new Error('No active session')

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

            const result = await this.currentSession.transact({ action })
            NotificationService.getInstance().success('Stake Successful', `Staked ${amount.toString()}`)
            return true
        } catch (error) {
            NotificationService.getInstance().error('Stake Failed', error instanceof Error ? error.message : 'Unknown error')
            return false
        }
    }

    async unstake(poolId: number, amount: Asset): Promise<boolean> {
        if (!this.currentSession) throw new Error('No active session')

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

            const result = await this.currentSession.transact({ action })
            NotificationService.getInstance().success('Unstake Successful', `Unstaked ${amount.toString()}`)
            return true
        } catch (error) {
            NotificationService.getInstance().error('Unstake Failed', error instanceof Error ? error.message : 'Unknown error')
            return false
        }
    }

    async claim(poolId: number): Promise<boolean> {
        if (!this.currentSession) throw new Error('No active session')

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

            const result = await this.currentSession.transact({ action })
            NotificationService.getInstance().success('Claim Successful', 'Rewards claimed successfully')
            return true
        } catch (error) {
            NotificationService.getInstance().error('Claim Failed', error instanceof Error ? error.message : 'Unknown error')
            return false
        }
    }
}

export default WharfKitService.getInstance()