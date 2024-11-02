export { default as WharfKitService } from './wharfkit'
export { default as NotificationService } from './notifications'
export { default as PoolAnalyticsService } from './analytics'

// Service initialization
export const initializeServices = async (): Promise<void> => {
    await WharfKitService.init()
}