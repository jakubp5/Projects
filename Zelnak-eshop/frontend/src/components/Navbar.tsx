import { AppBar, Badge, Box, Button, Toolbar, Typography } from '@mui/material'

import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useCurrentUser } from '../context/CurrentUserContext'
import { Routes } from '../enums'
import { UserRoleLabel } from '../enums/UserRole'

const Navbar: React.FC = () => {
    const { authenticated, signOut } = useAuth()
    const { currentUser, isCustomer, isRegisteredUser, isAdmin, isFarmer, isModerator } =
        useCurrentUser()
    const { cart } = useCart()

    return (
        <AppBar position="static" sx={{ backgroundColor: 'primary.main' }}>
            <Toolbar>
                {/* App Title */}
                <Box sx={{ flexGrow: 1 }}>
                    <MyLink to={Routes.Homepage} text={'Zelnak IS'} />
                </Box>

                {authenticated && currentUser && (
                    <Typography variant="body1" component="div" sx={{ mr: 2 }}>
                        Logged in: {currentUser.username}, role: {UserRoleLabel[currentUser.role]}
                    </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <MyLink to={Routes.Homepage} text="Home" />
                </Box>

                {isFarmer && (
                    <MyLink to={Routes.FarmerProfile + '/' + currentUser?.id} text="My page" />
                )}

                {authenticated ? (
                    <>
                        <MyLink to={Routes.Profile} text="Profile and orders" />
                        {(isRegisteredUser || isCustomer) && (
                            <Box sx={{ pr: 2 }}>
                                <MyLink to={Routes.Cart} text="Cart">
                                    <Badge badgeContent={cart.products.length} color="secondary">
                                        &nbsp;
                                    </Badge>
                                </MyLink>
                            </Box>
                        )}
                        <Button color="inherit" onClick={signOut}>
                            Logout
                        </Button>
                    </>
                ) : (
                    <>
                        <Button color="inherit" href="#/register">
                            Register
                        </Button>
                        <Button color="inherit" href="#/login">
                            Login
                        </Button>
                    </>
                )}

                {isAdmin && (
                    <Link to={Routes.AdminPage} style={{ textDecoration: 'none' }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{
                                mx: 1,
                            }}>
                            Admin dashboard
                        </Button>
                    </Link>
                )}

                {isModerator && (
                    <Link to={Routes.Categories} style={{ textDecoration: 'none' }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{
                                mx: 1,
                            }}>
                            Moderator dashboard
                        </Button>
                    </Link>
                )}
            </Toolbar>
        </AppBar>
    )
}

const MyLink = ({
    to,
    text,
    children,
}: {
    to: string
    text: string
    children?: React.ReactNode
}) => (
    <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Button color="inherit">{text}</Button>
        {children}
    </Link>
)

export default Navbar
