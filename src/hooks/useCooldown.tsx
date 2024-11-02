import { useState, useEffect, useCallback } from 'react'
import { TimePoint } from '@wharfkit/session'
import { StakedEntity } from '../types'
import { fetchTableData } from '../blockchain/tableQueries'
import { GAME_CONFIG } from '../config'

export const useCooldown = (stake: StakedEntity | undefined) => {
    const [cooldownProgress, setCooldownProgress] = useState(0)
    const [isReady, setIsReady] = useState(false)
    const [timeRemaining, setTimeRemaining] = useState<number>(0)
    const [configCooldown, setConfigCooldown] = useState<number>(0)

    useEffect(() => {
        // Fetch contract config for cooldown period
        const fetchConfig = async () => {
            const config = await fetchTableData.getConfig()
            if (config) {
                setConfigCooldown(config.cooldown_seconds_per_claim)
            }
        }
        fetchConfig()
    }, [])

    useEffect(() => {
        if (!stake || !configCooldown) {
            setIsReady(true)
            setCooldownProgress(100)
            setTimeRemaining(0)
            return
        }

        const updateCooldown = () => {
            const now = new Date().getTime()
            const cooldownEndTime = new Date(stake.cooldown_end_at.toString()).getTime()
            const timeDiff = cooldownEndTime - now

            if (timeDiff <= 0) {
                setIsReady(true)
                setCooldownProgress(100)
                setTimeRemaining(0)
            } else {
                setIsReady(false)
                // Calculate progress as percentage of cooldown completed
                const progress = ((configCooldown * 1000 - timeDiff) / (configCooldown * 1000)) * 100
                setCooldownProgress(Math.min(100, Math.max(0, progress)))
                setTimeRemaining(Math.ceil(timeDiff / 1000))
            }
        }

        updateCooldown()
        const interval = setInterval(updateCooldown, 1000)
        return () => clearInterval(interval)
    }, [stake, configCooldown])

    const formatTimeRemaining = useCallback((): string => {
        if (isReady) return 'Ready to Claim'
        
        const hours = Math.floor(timeRemaining / 3600)
        const minutes = Math.floor((timeRemaining % 3600) / 60)
        const seconds = timeRemaining % 60

        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`
        }
        if (minutes > 0) {
            return `${minutes}m ${seconds}s`
        }
        return `${seconds}s`
    }, [timeRemaining, isReady])

    return {
        cooldownProgress,
        isReady,
        timeRemaining,
        formatTimeRemaining,
        configCooldown
    }
}