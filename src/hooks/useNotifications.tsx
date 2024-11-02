import { useState, useEffect, useCallback } from 'react'
import { NotificationService } from '../services'
import { ToastConfig } from '../config/gameConfig'

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<ToastConfig[]>([])

    useEffect(() => {
        const unsubscribe = NotificationService.getInstance().subscribe((config) => {
            setNotifications(prev => {
                // Avoid duplicate notifications
                const isDuplicate = prev.some(n => 
                    n.title === config.title && 
                    n.message === config.message &&
                    n.type === config.type
                )
                if (isDuplicate) return prev
                return [...prev, config]
            })

            // Auto-remove notification after duration
            if (config.duration) {
                setTimeout(() => {
                    setNotifications(prev => 
                        prev.filter(n => n !== config)
                    )
                }, config.duration)
            }
        })

        return () => unsubscribe()
    }, [])

    const dismissNotification = useCallback((index: number) => {
        setNotifications(prev => 
            prev.filter((_, i) => i !== index)
        )
    }, [])

    const clearAllNotifications = useCallback(() => {
        setNotifications([])
    }, [])

    return {
        notifications,
        dismissNotification,
        clearAllNotifications,
        hasNotifications: notifications.length > 0
    }
}
