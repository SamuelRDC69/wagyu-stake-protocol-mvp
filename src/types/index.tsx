export * from './contract'
export * from './game'

// React-specific types
import { ReactNode } from 'react'

export interface WithChildren {
    children: ReactNode
}

// Common type utilities
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface RequestState {
    loading: boolean
    error: string | null
    lastUpdated?: Date
}

// Component Context Types
export interface SessionContextState {
    isLoggedIn: boolean
    isLoading: boolean
    error: string | null
}

export interface GameContextState {
    currentPool: number | null
    selectedGuild: number | null
    activeChallenge: number | null
}