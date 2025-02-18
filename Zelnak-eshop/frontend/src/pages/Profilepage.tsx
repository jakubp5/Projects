import { Box, Paper, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import { apiPut } from '../api/apiPut'
import { ZelnakButton } from '../components/ZelnakButton'
import { useAuth } from '../context/AuthContext'
import { useCurrentUser } from '../context/CurrentUserContext'
import { User } from '../types/User'
import Layout from './layouts/Layout'

const ProfilePage: React.FC = () => {
    const { currentUser } = useCurrentUser()
    const { authenticated, accessToken } = useAuth()

    const [user, _setUser] = useState<User | null>(currentUser)
    const [username, setUsername] = useState<string>(currentUser?.username || '')
    const [email, setEmail] = useState<string>(currentUser?.email || '')
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [_success, setSuccess] = useState<string | null>(null)

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

    return (
        <Layout>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    my: 5,
                }}>
                <Paper elevation={3} sx={{ p: 3, width: '100%', maxWidth: '500px' }}>
                    <Typography variant="h4" gutterBottom>
                        Profil uživatele
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
                                {user.created_at
                                    ? new Date(user.created_at).toLocaleString()
                                    : 'N/A'}
                            </Typography>
                        </>
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
            </Box>
        </Layout>
    )
}

export default ProfilePage
