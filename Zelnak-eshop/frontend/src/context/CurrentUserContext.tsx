import React, { createContext, useState, useEffect, useContext } from 'react'
import { UserRole } from '../enums/UserRole'
import { apiGet } from '../api/apiGet'
import { User } from '../types/User'

interface CurrentUserContextType {
    currentUser: User | null
    loading: boolean
    error: string | null
    refreshCurrentUser: () => void
    isAdmin: boolean
    isModerator: boolean
    isCustomer: boolean
    isFarmer: boolean
    isRegisteredUser: boolean
}

const CurrentUserContext = createContext<CurrentUserContextType | undefined>(undefined)

interface CurrentUserProviderProps {
    userId: string | null
    accessToken: string | null
    children: React.ReactNode
}

export const CurrentUserProvider = (props: CurrentUserProviderProps) => {
    const { userId, accessToken, children } = props
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [loading, setLoading] = useState<boolean>(true) // important true, refresh
    const [error, setError] = useState<string | null>(null)

    const isAdmin = currentUser?.role === UserRole.Admin
    const isModerator = currentUser?.role === UserRole.Moderator
    const isCustomer = currentUser?.role === UserRole.Customer
    const isFarmer = currentUser?.role === UserRole.Farmer
    const isRegisteredUser = currentUser?.role === UserRole.Registered

    const handleGetCurrentUser = async () => {
        if (userId && accessToken) {
            setLoading(true)
            await apiGet<User>(`/users/${userId}`, accessToken)
                .then((userData) => {
                    setCurrentUser(userData)
                    setLoading(false)
                })
                .catch((_error) => {
                    setLoading(false)
                    setError('Failed to fetch user data')
                })
        } else {
            setCurrentUser(null)
            setLoading(false)
        }
    }

    useEffect(() => {
        handleGetCurrentUser()
    }, [userId])

    const refreshCurrentUser = () => {
        handleGetCurrentUser()
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <CurrentUserContext.Provider
            value={{
                currentUser,
                loading,
                error,
                refreshCurrentUser,
                isAdmin,
                isModerator,
                isCustomer,
                isFarmer,
                isRegisteredUser,
            }}>
            {children}
        </CurrentUserContext.Provider>
    )
}

export const useCurrentUser = (): CurrentUserContextType => {
    const context = useContext(CurrentUserContext)
    if (context === undefined) {
        throw new Error('useCurrentUser must be used within a CurrentUserProvider')
    }
    return context
}
