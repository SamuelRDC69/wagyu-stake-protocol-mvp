import { GAME_CONFIG } from '../config'

export const ANIMATIONS = {
    FADE_IN: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: GAME_CONFIG.UI.ANIMATION_DURATION / 1000 }
    },

    SCALE_IN: {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
        transition: { duration: GAME_CONFIG.UI.ANIMATION_DURATION / 1000 }
    },

    SLIDE_UP: {
        initial: { y: 20, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: 20, opacity: 0 },
        transition: { duration: GAME_CONFIG.UI.ANIMATION_DURATION / 1000 }
    },

    PULSE: {
        initial: { scale: 1 },
        animate: { 
            scale: [1, 1.05, 1],
            transition: { 
                duration: 1,
                repeat: Infinity 
            }
        }
    },

    REWARD_CLAIM: {
        initial: { scale: 0.8, y: 20, opacity: 0 },
        animate: { 
            scale: 1.2,
            y: -10,
            opacity: 1,
            transition: { duration: 0.3 }
        },
        exit: { 
            scale: 1,
            y: -30,
            opacity: 0,
            transition: { duration: 0.2 }
        }
    }
}

export const getProgressBarColor = (percentage: number): string => {
    if (percentage >= 80) return '#4CAF50'
    if (percentage >= 60) return '#8BC34A'
    if (percentage >= 40) return '#FFC107'
    if (percentage >= 20) return '#FF9800'
    return '#F44336'
}

export const getHealthIndicatorColor = (health: number): string => {
    if (health >= GAME_CONFIG.POOL_HEALTH.HEALTHY_THRESHOLD) return '#4CAF50'
    if (health >= GAME_CONFIG.POOL_HEALTH.WARNING_THRESHOLD) return '#FFC107'
    return '#F44336'
}