import { useState, useEffect, useCallback } from 'react'
import { WharfKitService } from '../services'
import { Session } from '@wharfkit/session'

export const useSession = () => {
    const [session, setSession] = useState<Session | undefined>()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Check for existing session on mount
        const currentSession = WharfKitService.getSession()
        setSession(currentSession)
        setIsLoading(false)
    }, [])

    const login = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            await WharfKitService.login()
            setSession(WharfKitService.getSession())
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to login')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const logout = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            await WharfKitService.logout()
            setSession(undefined)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to logout')
        } finally {
            setIsLoading(false)
        }
    }, [])

    return {
        session,
        isLoading,
        error,
        login,
        logout,
        isLoggedIn: !!session
    }
}