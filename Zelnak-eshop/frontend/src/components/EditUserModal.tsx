import React, { useState } from 'react'
import { Modal, Box, Typography, TextField, Button } from '@mui/material'
import api from '../api/api'
import { User } from '../types/User'

interface EditUserModalProps {
    user: User
    open: boolean
    onClose: () => void
    onUserUpdated: (updatedUser: User) => void
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, open, onClose, onUserUpdated }) => {
    const [username, setUsername] = useState(user.username)
    const [email, setEmail] = useState(user.email)
    const [error, setError] = useState<string | null>(null)

    const handleUpdateUser = async () => {
        try {
            const updatedUser = { username, email }
            const response = await api.put(`/users/${user.id}`, updatedUser)
            onUserUpdated(response.data)
            onClose()
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update user')
        }
    }

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    p: 4,
                    backgroundColor: 'white',
                    margin: 'auto',
                    mt: '10%',
                    width: '400px',
                    borderRadius: '8px',
                }}>
                <Typography variant="h6" gutterBottom>
                    Edit User
                </Typography>
                {error && <Typography color="error">{error}</Typography>}
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

                <Button variant="contained" color="primary" onClick={handleUpdateUser} fullWidth>
                    Update User
                </Button>
            </Box>
        </Modal>
    )
}

export default EditUserModal
