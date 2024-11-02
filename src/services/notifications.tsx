import { ToastConfig } from '../config/gameConfig'
import { Asset } from '@wharfkit/session'

type NotificationCallback = (config: ToastConfig) => void

class NotificationService {
    private static instance: NotificationService
    private callbacks: NotificationCallback[] = []

    private constructor() {}

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService()
        }
        return NotificationService.instance
    }

    subscribe(callback: NotificationCallback): () => void {
        this.callbacks.push(callback)
        return () => {
            this.callbacks = this.callbacks.filter(cb => cb !== callback)
        }
    }

    private notify(config: ToastConfig): void {
        this.callbacks.forEach(callback => callback(config))
    }

    // Staking notifications
    stakeSuccess(amount: Asset): void {
        this.notify({
            type: 'success',
            title: 'Stake Successful',
            message: `Successfully staked ${amount.toString()}`,
            duration: 5000
        })
    }

    stakeFailed(error: string): void {
        this.notify({
            type: 'error',
            title: 'Stake Failed',
            message: `Failed to stake: ${error}`,
            duration: 5000
        })
    }

    // Claim notifications
    claimSuccess(amount: Asset): void {
        this.notify({
            type: 'success',
            title: 'Claim Successful',
            message: `Successfully claimed ${amount.toString()}`,
            duration: 5000
        })
    }

    claimFailed(error: string): void {
        this.notify({
            type: 'error',
            title: 'Claim Failed',
            message: `Failed to claim: ${error}`,
            duration: 5000
        })
    }

    // Guild notifications
    guildBattleStarted(): void {
        this.notify({
            type: 'info',
            title: 'Guild Battle Started',
            message: 'A new guild battle has begun! Participate with your guild to earn rewards.',
            duration: 7000
        })
    }

    guildBattleEnded(): void {
        this.notify({
            type: 'info',
            title: 'Guild Battle Ended',
            message: 'The guild battle has ended. Check your rewards!',
            duration: 7000
        })
    }

    // Challenge notifications
    challengeCompleted(reward: Asset): void {
        this.notify({
            type: 'success',
            title: 'Challenge Completed',
            message: `Congratulations! You earned ${reward.toString()}`,
            duration: 7000
        })
    }

    // Pool health notifications
    poolHealthWarning(poolId: number, health: number): void {
        this.notify({
            type: 'warning',
            title: 'Pool Health Warning',
            message: `Pool ${poolId} health is at ${health}%. Consider waiting to claim.`,
            duration: 10000
        })
    }
}

export default NotificationService.getInstance()