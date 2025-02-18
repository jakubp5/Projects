import React, { useEffect, useState } from 'react'
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Link,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { apiGet } from '../api/apiGet'

interface Product {
    id: number
    name: string
    price: number
    description: string
    image: string
    user_id: number
    category_id: number
    created_at: string
}

interface User {
    id: number
    username: string
    email: string
}

interface Category {
    id: number
    name: string
    parent_id: number | null
}

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[] | any[]>([])
    const [users, setUsers] = useState<{ [key: number]: User }>({})
    const [categories, setCategories] = useState<{ [key: number]: Category[] }>({})
    const [error, setError] = useState<string | null>(null)
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await apiGet('/products')
                setProducts(response as any)

                // Fetch user details for each product
                const userIds = Array.from(
                    new Set((response as any).map((product: Product) => product.user_id))
                )
                const userResponses = await Promise.all(userIds.map((id) => apiGet(`/users/${id}`)))
                const usersData = userResponses.reduce((acc, user) => {
                    ;(acc as any)[(user as any).id] = user
                    return acc
                }, {} as { [key: number]: User })
                setUsers(usersData as any)

                // Fetch category hierarchy for each product
                const categoryIds = Array.from(
                    new Set((response as any).map((product: Product) => product.category_id))
                )
                const categoryResponses = await Promise.all(
                    categoryIds.map((id) => apiGet(`/categories/${id}/hierarchy`))
                )
                const categoriesData = categoryResponses.reduce((acc, hierarchy, index) => {
                    ;(acc as any)[categoryIds[index] as any] = hierarchy
                    return acc
                }, {} as { [key: number]: Category[] })
                setCategories(categoriesData as any)
            } catch (err: any) {
                console.error('Error fetching products:', err)
                setError(err.response?.data?.message || 'Failed to fetch products')
            }
        }

        fetchProducts()
    }, [])

    const handleFarmerClick = (farmerId: number) => {
        navigate(`/farmers/${farmerId}`)
    }

    const handleCategoryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSelectedCategory(event.target.value as number)
    }

    const filteredProducts = selectedCategory
        ? products.filter((product) => product.category_id === selectedCategory)
        : products

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" gutterBottom>
                Products
            </Typography>

            {error && <Typography color="error">{error}</Typography>}

            <FormControl fullWidth sx={{ mb: 4 }}>
                <InputLabel id="category-filter-label">Filter by Category</InputLabel>
                <Select
                    labelId="category-filter-label"
                    value={selectedCategory || ''}
                    onChange={handleCategoryChange as any}
                    label="Filter by Category">
                    <MenuItem value="">
                        <em>All Categories</em>
                    </MenuItem>
                    {Object.values(categories)
                        .flat()
                        .map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                                {category.name}
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {filteredProducts.map((product) => (
                    <Card key={product.id} sx={{ maxWidth: 345 }}>
                        <CardMedia
                            component="img"
                            height="140"
                            image={product.image !== 'x' ? product.image : '/apple-touch-icon.png'} // if no image then random placeholder
                            alt={product.name}
                        />
                        <CardContent>
                            <Typography variant="h5" component="div">
                                {product.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {product.description}
                            </Typography>
                            <Typography variant="subtitle1" color="primary">
                                Price: ${product.price}
                            </Typography>
                            {users[product.user_id] && (
                                <Typography variant="body2" color="text.secondary">
                                    Seller:{' '}
                                    <Link
                                        component="button"
                                        onClick={() =>
                                            handleFarmerClick(users[product.user_id].id)
                                        }>
                                        {users[product.user_id].username}
                                    </Link>
                                </Typography>
                            )}
                            {categories[product.category_id] && (
                                <Typography variant="body2" color="text.secondary">
                                    Categories:{' '}
                                    {categories[product.category_id]
                                        .map((cat) => cat.name)
                                        .join(' > ')}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    )
}

export default ProductsPage
