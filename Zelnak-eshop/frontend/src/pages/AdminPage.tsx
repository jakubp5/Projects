import { Box, List, ListItem, ListItemText, MenuItem, Select, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import api from '../api/api'
import { apiPut } from '../api/apiPut'
import EditUserModal from '../components/EditUserModal'
import { useAuth } from '../context/AuthContext'
import { UserRole, UserRoleLabel } from '../enums/UserRole'
import Layout from './layouts/Layout'
import ZelnakBox from './layouts/ZelnakBox'

interface User {
    id: number
    username: string
    email: string
    role: UserRole
}

const AdminPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([])
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [error, setError] = useState<string | null>(null)

    const { accessToken } = useAuth()

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/users')
                setUsers(response.data)
            } catch (err: any) {
                console.error('Failed to fetch users', err)
                setError(err.response?.data?.message || 'Failed to fetch users')
            }
        }

        fetchUsers()
    }, [])

    const handleRoleChange = async (userId: number, newRole: UserRole) => {
        if (!accessToken) return

        try {
            await apiPut(`/users/${userId}`, { role: newRole.toString() }, accessToken)
            setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
        } catch (err: any) {
            console.error('Failed to update user role', err)
            setError(err.response?.data?.message || 'Failed to update user role')
        }
    }

    const handleUserClick = (user: User) => {
        setSelectedUser(user)
    }

    const handleUserUpdated = (updatedUser: User) => {
        setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
    }

    return (
        <Layout>
            <ZelnakBox>
                <Box sx={{ padding: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        Admin - Manage User Roles
                    </Typography>

                    {error && <Typography color="error">{error}</Typography>}

                    <List>
                        {users.map((user) => (
                            <ListItem key={user.id}>
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="body1"
                                            component="span"
                                            sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                                            onClick={() => handleUserClick(user)}>
                                            {user.username}
                                        </Typography>
                                    }
                                    secondary={user.email}
                                />
                                <Select
                                    value={user.role}
                                    onChange={(e) =>
                                        handleRoleChange(
                                            user.id,
                                            parseInt(e.target.value as string) as UserRole
                                        )
                                    }>
                                    {Object.keys(UserRole)
                                        .filter((key) => isNaN(Number(key))) // Filter out numeric values
                                        .map((role) => (
                                            <MenuItem
                                                key={UserRole[role as keyof typeof UserRole]}
                                                value={UserRole[role as keyof typeof UserRole]}>
                                                {
                                                    UserRoleLabel[
                                                        UserRole[role as keyof typeof UserRole]
                                                    ]
                                                }
                                            </MenuItem>
                                        ))}
                                </Select>
                            </ListItem>
                        ))}
                    </List>

                    {selectedUser && (
                        <EditUserModal
                            user={selectedUser}
                            open={Boolean(selectedUser)}
                            onClose={() => setSelectedUser(null)}
                            onUserUpdated={handleUserUpdated}
                        />
                    )}
                </Box>
            </ZelnakBox>
        </Layout>
    )
}

export default AdminPage
