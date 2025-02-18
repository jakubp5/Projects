import { Box, Paper, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet } from '../../api/apiGet'
import { apiPut } from '../../api/apiPut'
import { ZelnakButton } from '../../components/ZelnakButton'
import { useAuth } from '../../context/AuthContext'
import { useCurrentUser } from '../../context/CurrentUserContext'
import { Routes } from '../../enums'
import { Order } from '../../types/Order'
import { User } from '../../types/User'
import { formatDateTime } from '../../utils/myUtils'
import Layout from '../layouts/Layout'
import ProfileFarmerOrders from './ProfileFarmerOrders'
import ProfileOrders from './ProfileOrders'

const ProfilePage: React.FC = () => {
    const { currentUser, isCustomer, isFarmer, isModerator, isRegisteredUser } = useCurrentUser()
    const { authenticated, accessToken } = useAuth()

    const [user, _setUser] = useState<User | null>(currentUser)
    const [username, setUsername] = useState<string>(currentUser?.username || '')
    const [email, setEmail] = useState<string>(currentUser?.email || '')
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [_success, setSuccess] = useState<string | null>(null)
    const [userOrders, setUserOrders] = useState<Order[]>([])
    const [farmerOrders, setFarmerOrders] = useState<Order[]>([])

    const fetchUserOrders = async () => {
        if (!authenticated || !accessToken) return

        try {
            const response = await apiGet<Order[]>(`/orders/user/${user?.id}`, accessToken)
            setUserOrders(response)
        } catch (err: any) {
            console.error('Failed to fetch orders', err)
        }
    }

    const fetchFarmerOrders = async () => {
        if (!authenticated || !accessToken) return

        try {
            const response = await apiGet<Order[]>(`/orders/${user?.id}/items`, accessToken)
            setFarmerOrders(response)
        } catch (err: any) {
            console.error('Failed to fetch orders', err)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!authenticated || !accessToken) return

        setLoading(true)
        setError(null)

        const updatedDetails = { username, email }
        try {
            await apiPut<User>(`/users/${user?.id}`, updatedDetails, accessToken)
            setSuccess('Profile updated successfully')
        } catch (error: any) {
            setError(error.message)
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchUserOrders()
        fetchFarmerOrders()
    }, [user])

    const condition = isModerator || isCustomer || isRegisteredUser
    return (
        <Layout>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 5,
                    gap: 3,
                }}>
                <Paper elevation={3} sx={{ p: 3, width: '760px' }}>
                    <Typography variant="h4" gutterBottom>
                        User profile
                    </Typography>
                    {user && (
                        <>
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                <strong>ID:</strong> {user.id}
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                <strong>Username:</strong> {user.username}
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                <strong>Email:</strong> {user.email}
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                <strong>Account Created:</strong>{' '}
                                {user.created_at ? formatDateTime(user.created_at) : 'N/A'}
                            </Typography>
                        </>
                    )}

                    {condition && (
                        <Link to={Routes.AddCategory}>
                            <ZelnakButton sx={{ my: 1 }}>Suggest category</ZelnakButton>
                        </Link>
                    )}

                    <Box component="form" onSubmit={handleUpdateProfile} sx={{ mt: 3 }}>
                        <TextField
                            label="Username"
                            variant="outlined"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Email"
                            variant="outlined"
                            fullWidth
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        <ZelnakButton color="primary" type="submit" fullWidth disabled={loading}>
                            Update Profile
                        </ZelnakButton>
                    </Box>

                    {loading && <Typography variant="body1">Loading...</Typography>}

                    {error && (
                        <Typography variant="body1" color="error">
                            {error}
                        </Typography>
                    )}
                </Paper>

                {/* Customer orders */}
                {isCustomer && (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                        <Paper elevation={3} sx={{ p: 3, width: '760px' }}>
                            <ProfileOrders orders={userOrders} loading={loading} />
                        </Paper>
                    </Box>
                )}

                {/* Farmer orders */}
                {isFarmer && (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                        <Paper elevation={3} sx={{ p: 3, width: '760px' }}>
                            <ProfileFarmerOrders orders={farmerOrders} loading={loading} />
                        </Paper>
                    </Box>
                )}
            </Box>
        </Layout>
    )

    // get orders by userid
}

export default ProfilePage
