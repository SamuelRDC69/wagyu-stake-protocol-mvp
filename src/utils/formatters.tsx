import { Asset, Name, TimePoint } from '@wharfkit/session'
import { DEFAULT_TOKEN_PRECISION } from '../config/contract'

export const formatAsset = (asset: Asset): string => {
    return `${(Number(asset.value) / Math.pow(10, DEFAULT_TOKEN_PRECISION)).toFixed(DEFAULT_TOKEN_PRECISION)} ${asset.symbol}`
}

export const formatTimeLeft = (timePoint: TimePoint): string => {
    const now = new Date()
    const target = new Date(timePoint.toString())
    const diff = target.getTime() - now.getTime()

    if (diff <= 0) return 'Now'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
}

export const formatAccount = (name: Name): string => {
    return name.toString()
}

export const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(2)}%`
}

export const formatTierName = (name: string): string => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
}

export const formatRewardProjection = (
    currentStake: Asset,
    poolWeight: number,
    timeHeld: number
): Asset => {
    // Implement reward projection calculation based on contract logic
    // This is a placeholder that should match the contract's calculation
    return currentStake
}