import { useState, useEffect, useCallback } from 'react'
import { Session } from '@wharfkit/session'
import WharfKitService from '../services/wharfkit'
import RpcService from '../blockchain/rpcService'

export const useSession = () => {
    const [session, setSession] = useState<Session | undefined>()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [accountInfo, setAccountInfo] = useState<any>(null)

    useEffect(() => {
        const initSession = async () => {
            try {
                setIsLoading(true)
                const currentSession = WharfKitService.getSession()
                setSession(currentSession)

                if (currentSession?.actor) {
                    const accInfo = await RpcService.getAccount(currentSession.actor.toString())
                    setAccountInfo(accInfo)
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to initialize session')
            } finally {
                setIsLoading(false)
            }
        }

        initSession()
    }, [])

    const login = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            await WharfKitService.login()
            const newSession = WharfKitService.getSession()
            setSession(newSession)

            if (newSession?.actor) {
                const accInfo = await RpcService.getAccount(newSession.actor.toString())
                setAccountInfo(accInfo)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to login')
            throw err
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
            setAccountInfo(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to logout')
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [])

    return {
        session,
        accountInfo,
        isLoading,
        error,
        login,
        logout,
        isLoggedIn: !!session
    }
}