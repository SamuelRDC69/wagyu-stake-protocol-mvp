export { useSession } from './useSession'
export { useStaking } from './useStaking'
export { usePoolHealth } from './usePoolHealth'
export { useNotifications } from './useNotifications'
export { useCooldown } from './useCooldown'
export { useGuild } from './useGuild'
export { useChallenges } from './useChallenges'
export { useClaimStrategy } from './useClaimStrategy'

// Type-guard helper
export const isTimePoint = (value: any): value is Date => {
    return value instanceof Date
}