import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    CircularProgress,
    Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiDelete } from '../../api/apiDelete'
import { apiGet } from '../../api/apiGet'
import { ZelnakButton } from '../../components/ZelnakButton'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useCurrentUser } from '../../context/CurrentUserContext'
import { Routes } from '../../enums'
import colors from '../../styles/colors'
import { Category } from '../../types/Category'
import { Product } from '../../types/Product'

interface HomepageProductsProps {
    products: Product[]
    allowDelete?: boolean
    showAddButton?: boolean // Add the parameter to show/hide the "Create New Event" button
}

/**
 * vytpsat quantity , jiz se vraci
 * seller name vypsat, kubo nejdriv prida
 */

export const HomepageProducts: React.FC<HomepageProductsProps> = ({
    products,
    allowDelete = false,
    showAddButton = false,
}) => {
    const { addProduct } = useCart()
    const { authenticated, accessToken } = useAuth()
    const { isFarmer } = useCurrentUser()

    const [categories, setCategories] = useState<{ [key: number]: Category[] }>({})
    const [productMessage, setProductMessage] = useState<{
        productId: number | null
        message: string
    } | null>({
        productId: null,
        message: '',
    })

    const fetchCategoriesTree = async () => {
        try {
            const categoryIds = Array.from(
                new Set(products.map((product: Product) => product.category_id))
            )
            const categoryResponses = await Promise.all(
                categoryIds.map((id) => apiGet<any>(`/categories/${id}/hierarchy`))
            )
            const categoriesData = categoryResponses.reduce((acc, hierarchy, index) => {
                ;(acc as any)[categoryIds[index] as any] = hierarchy
                return acc
            }, {} as { [key: number]: Category[] })
            setCategories(categoriesData)
        } catch (err: any) {
            console.error('Failed to fetch categories', err)
        }
    }

    /**
     * Delete
     */
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false)
    const [deleteError, setDeleteError] = useState<{
        productId: number | null
        message: string
    } | null>({
        productId: null,
        message: '',
    })

    const deleteProduct = async (productId: number) => {
        if (!accessToken || !authenticated) return

        setDeleteError(null)
        setProductMessage(null)
        setDeleteLoading(true)

        try {
            setDeleteLoading(true)
            await apiDelete<any>(`/products/${productId}`, accessToken)
            setDeleteLoading(false)
            setProductMessage({ productId: productId, message: 'Product deleted' })
            setTimeout(() => {
                setProductMessage(null)
            }, 3000)
            window.location.reload()
        } catch (error: any) {
            console.log('Failed to delete product', error)
            setDeleteError({
                productId: productId,
                message: error.message,
            })
            setDeleteLoading(false)
        }
    }

    useEffect(() => {
        if (products.length && products.length > 0) {
            fetchCategoriesTree()
        }
    }, [products])

    const handleProductMessage = (productId: number, message: string) => {
        setProductMessage({ productId, message })
        setTimeout(() => {
            setProductMessage(null)
        }, 3000)
    }

    return (
        <>
            <Typography variant="h1" component="h2" mb={3} textAlign="center">
                Products
            </Typography>
            <Box
                className="all-products"
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 2,
                    mb: 5,
                }}>
                {products.map((product, index) => (
                    <Card key={index}>
                        <CardMedia component="img" height="140" image={product.image} />
                        <CardContent>
                            <CardActionArea>
                                <Link
                                    to={`${Routes.Products}/${product.id}`}
                                    style={{ textDecoration: 'none' }}>
                                    <Typography
                                        gutterBottom
                                        variant="h5"
                                        component="h4"
                                        sx={{ color: colors.colorText }}>
                                        {product.name}
                                    </Typography>
                                </Link>
                            </CardActionArea>
                            <Typography variant="body2" sx={{ color: colors.colorText }}>
                                {product.description}
                            </Typography>
                            {categories[product.category_id] && (
                                <Typography variant="body2" sx={{ color: colors.colorText }}>
                                    Categories:{' '}
                                    {categories[product.category_id]
                                        .map((cat) => cat.name)
                                        .join(' > ')}
                                </Typography>
                            )}
                            <Typography variant="body2" sx={{ color: colors.colorText }}>
                                Price: {product.price} $
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.colorText }}>
                                Quantity: {product.quantity}
                            </Typography>
                            {!allowDelete && (
                                <Link to={`${Routes.Seller}/${product.user_id}`}>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: colors.colorText }}
                                        mb={2}>
                                        Seller: {product.username}
                                    </Typography>
                                </Link>
                            )}
                            {authenticated ? (
                                <>
                                    <ZelnakButton
                                        onClick={() => {
                                            addProduct(
                                                product.id,
                                                1,
                                                product.price,
                                                product.user_id,
                                                product.username
                                            )
                                            handleProductMessage(product.id, 'Added to cart')
                                        }}
                                        color="secondary"
                                        sx={{
                                            mt: 1,
                                        }}
                                        disabled={product.quantity === 0 || isFarmer}
                                        fullWidth>
                                        Add to cart
                                    </ZelnakButton>

                                    {allowDelete && (
                                        <ZelnakButton
                                            onClick={() => {
                                                deleteProduct(product.id)
                                            }}
                                            color="secondary"
                                            sx={{
                                                mt: 1,
                                            }}
                                            disabled={deleteLoading}
                                            fullWidth>
                                            {deleteLoading ? (
                                                <CircularProgress size={20} />
                                            ) : (
                                                'Delete product'
                                            )}
                                        </ZelnakButton>
                                    )}

                                    {allowDelete && (
                                        <Link
                                            to={`${Routes.EditProduct}/${product.id}`}
                                            style={{ textDecoration: 'none' }}>
                                            <ZelnakButton
                                                color="primary"
                                                sx={{
                                                    mt: 1,
                                                }}
                                                fullWidth>
                                                Edit product
                                            </ZelnakButton>
                                        </Link>
                                    )}

                                    {productMessage?.productId === product.id && (
                                        <Typography
                                            color="success"
                                            sx={{ mt: 2 }}
                                            textAlign={'center'}>
                                            {productMessage.message} abc
                                        </Typography>
                                    )}

                                    {deleteError && deleteError.productId === product.id && (
                                        <Typography
                                            color="error"
                                            sx={{ mt: 2 }}
                                            textAlign={'center'}>
                                            {deleteError.message}
                                        </Typography>
                                    )}
                                </>
                            ) : (
                                <Typography color="error" sx={{ mt: 2 }} textAlign={'center'}>
                                    You have have to login first.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {showAddButton && (
                <Link to={Routes.AddProduct} style={{ textDecoration: 'none' }}>
                    <ZelnakButton
                        sx={{
                            display: 'block',
                            margin: 'auto',
                        }}>
                        Add new product
                    </ZelnakButton>
                </Link>
            )}
        </>
    )
}
