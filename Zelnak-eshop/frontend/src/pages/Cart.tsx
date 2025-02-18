import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import {
    Box,
    CircularProgress,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiPost } from '../api/apiPost'
import { ZelnakButton } from '../components/ZelnakButton'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { LocalStorage, Routes } from '../enums'
import Layout from './layouts/Layout'

interface OrderResponse {
    message: string
    order: {
        id: number
        buyer_id: string
        status: string
    }
}

const Cart: React.FC = () => {
    const { authenticated, userId } = useAuth()
    const { cart, updateProductQuantity, clearCart, removeProduct } = useCart()
    const [message, setMessage] = useState<string | null>(null)
    const [totalPrice, setTotalPrice] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const calculateTotalPrice = () => {
            const total = cart.products.reduce(
                (sum, product) => sum + product.price * product.quantity,
                0
            )
            setTotalPrice(total)
        }

        calculateTotalPrice()
    }, [cart.products])

    const handleCreateOrder = async () => {
        if (!authenticated) {
            setMessage('User is not authenticated')
            return
        }

        const token = localStorage.getItem(LocalStorage.token)
        if (!token) {
            setMessage('User is not authenticated')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const orderData = {
                buyer_id: userId,
                products: cart.products.map((product) => ({
                    product_id: product.id,
                    seller_id: product.seller_id, // Ensure seller_id is included in the product data
                    quantity: product.quantity,
                })),
            }

            const response = await apiPost<OrderResponse>('/orders', orderData, token)
            setMessage(response.message || 'Order created successfully!')
            setLoading(false)
            setError(null)

            clearCart()
        } catch (error: any) {
            setMessage(null)
            setError(error.response?.data?.message || 'Failed to create order')
            setLoading(false)
        }
    }

    const handleIncreaseQuantity = (productId: number) => {
        updateProductQuantity(productId, 1)
    }

    const handleDecreaseQuantity = (productId: number) => {
        if (cart.products.find((product) => product.id === productId)?.quantity === 1) {
            removeProduct(productId)
        } else {
            updateProductQuantity(productId, -1)
        }
    }

    return (
        <Layout>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 5,
                }}>
                <Paper elevation={3} sx={{ p: 3, width: '760px' }}>
                    {authenticated ? (
                        <>
                            <Typography variant="h4" component="h1" gutterBottom>
                                Shopping Cart
                            </Typography>
                            {cart.products.length === 0 ? (
                                <>
                                    <Typography variant="body1" mb={2}>
                                        Your cart is empty.
                                    </Typography>
                                    <Link to={Routes.Homepage}>
                                        <ZelnakButton color="primary">
                                            Add products to cart
                                        </ZelnakButton>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <List
                                        sx={{
                                            gap: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}>
                                        {cart.products.map((product) => (
                                            <ListItem
                                                key={product.id}
                                                sx={{
                                                    border: 0.5,
                                                }}>
                                                <ListItemText
                                                    primary={`Product name: ${product.productName}`}
                                                    secondary={`Quantity: ${product.quantity}`}
                                                />
                                                <IconButton
                                                    color="primary"
                                                    onClick={() =>
                                                        handleIncreaseQuantity(product.id)
                                                    }>
                                                    <AddIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="secondary"
                                                    onClick={() =>
                                                        handleDecreaseQuantity(product.id)
                                                    }>
                                                    <RemoveIcon />
                                                </IconButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                    <Typography variant="h6" component="div" sx={{ my: 2 }}>
                                        Total Price: ${totalPrice.toFixed(2)}
                                    </Typography>
                                    <ZelnakButton
                                        color="primary"
                                        sx={{
                                            textAlign: 'center',
                                            display: 'block',
                                            margin: '0 auto',
                                        }}
                                        onClick={handleCreateOrder}
                                        disabled={loading}>
                                        {loading ? <CircularProgress size={24} /> : 'Create Order'}
                                    </ZelnakButton>
                                </>
                            )}
                            {message && (
                                <>
                                    <Typography
                                        variant="body1"
                                        color="success.main"
                                        sx={{ mt: 2, mb: 2 }}>
                                        {message}
                                    </Typography>

                                    <Link to={Routes.Profile}>
                                        <ZelnakButton color="primary">
                                            Show your orders
                                        </ZelnakButton>
                                    </Link>
                                </>
                            )}
                            {error && (
                                <Typography variant="body1" color="error" sx={{ mt: 2 }}>
                                    {error}
                                </Typography>
                            )}
                        </>
                    ) : (
                        <Typography variant="body1">Please log in to view your cart.</Typography>
                    )}
                </Paper>
            </Box>
        </Layout>
    )
}

export default Cart
