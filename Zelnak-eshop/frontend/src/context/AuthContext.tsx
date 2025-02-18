import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react'
import { LocalStorage } from '../enums'

interface AuthContextProps {
    userId: string | null
    setUserId: React.Dispatch<React.SetStateAction<string | null>>
    authenticated: boolean
    accessToken: string | null
    setAccessToken: React.Dispatch<React.SetStateAction<string | null>>
    loading: boolean
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
    signOut: () => void
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userId, setUserId] = useState<string | null>(null)
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    const authenticated = !!accessToken

    useEffect(() => {
        // Fetch token only on initial mount
        const storedToken = localStorage.getItem(LocalStorage.AccessToken)
        if (storedToken && storedToken !== accessToken) {
            setAccessToken(storedToken)
        }

        const storedUserId = localStorage.getItem(LocalStorage.UserId)
        if (storedUserId && storedUserId !== userId) {
            setUserId(storedUserId)
        }

        setLoading(false)
    }, [])

    const signOut = () => {
        localStorage.removeItem(LocalStorage.AccessToken)
        localStorage.removeItem(LocalStorage.UserId)
        setAccessToken(null)
        setUserId(null)

        window.location.reload()
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <AuthContext.Provider
            value={{
                userId,
                setUserId,
                authenticated,
                accessToken,
                setAccessToken,
                loading,
                setLoading,
                signOut,
            }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
