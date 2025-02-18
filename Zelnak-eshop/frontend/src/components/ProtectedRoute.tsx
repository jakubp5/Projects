import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '../context/CurrentUserContext'
import { Routes, UserRole } from '../enums'

interface ProtectedRouteProps {
    element: JSX.Element
    by?: 'all'
    allowedRoles: UserRole[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, allowedRoles }) => {
    const [condition, setCondition] = useState<boolean>(true)
    const { currentUser } = useCurrentUser()
    const userRole = currentUser?.role

    useEffect(() => {
        if (allowedRoles.includes(userRole!)) {
            setCondition(true)
        } else {
            setCondition(false)
        }
    }, [])

    return condition ? element : <Navigate to={Routes.Homepage} />
}

export default ProtectedRoute
