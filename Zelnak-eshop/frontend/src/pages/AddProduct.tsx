import { FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import { FormEvent, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/api'
import { apiGet } from '../api/apiGet'
import { apiPost } from '../api/apiPost'
import { apiPut } from '../api/apiPut'
import { ZelnakButton } from '../components/ZelnakButton'
import { useAuth } from '../context/AuthContext'
import { useCurrentUser } from '../context/CurrentUserContext'
import { Product } from '../types/Product'
import Layout from './layouts/Layout'
import ZelnakBox from './layouts/ZelnakBox'

interface Category {
    id: number
    name: string
}

interface AddProductProps {
    edit?: boolean
}

interface FormData {
    name: string
    price: number
    description: string
    image: string
    category_id: number
    quantity: number
}

const emptyFormData = {
    name: '',
    price: 0,
    description: '',
    image: '',
    category_id: 0,
    quantity: 0,
}

const AddProduct = (props: AddProductProps) => {
    const { edit = false } = props

    const { id } = useParams<{ id: string }>()

    const getProductById = async (id: string) => {
        try {
            const response = await apiGet<Product>(`/products/${id}`)
            console.log(response)

            setFormData({
                name: response.name,
                price: response.price,
                description: response.description,
                image: response.image,
                category_id: Number(response.category_id),
                quantity: response.quantity,
            })
        } catch (error: any) {
            console.error('Failed to fetch product', error)
        }
    }

    useEffect(() => {
        if (edit && id) {
            getProductById(id)
        }
    }, [edit, id])

    const [formData, setFormData] = useState<FormData>(emptyFormData)
    const [categories, setCategories] = useState<Category[]>([])
    const [message, setMessage] = useState('')
    const { accessToken } = useAuth()
    const { currentUser } = useCurrentUser()

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories')
                setCategories(response.data)
            } catch (err: any) {
                setMessage(err.response?.data?.message || 'Failed to fetch categories')
            }
        }

        fetchCategories()
    }, [])

    const handleSetValue = (key: keyof typeof formData, value: string) => {
        setFormData({ ...formData, [key]: value })
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        try {
            const userId = currentUser?.id
            if (!accessToken || !userId) {
                setMessage('User is not authenticated')
                return
            }

            const response = !edit
                ? await apiPost<any>('/products', { ...formData, user_id: userId }, accessToken)
                : await apiPut<any>(`/products/${id}`, formData, accessToken)

            setMessage(response.message || 'Product added successfully!')
        } catch (error: any) {
            setMessage(error.message || 'Error occurred')
        }
    }

    return (
        <Layout>
            <ZelnakBox>
                <Typography variant="h4" component="h1" gutterBottom>
                    {edit ? 'Edit Product' : 'Add Product'}
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Name"
                        variant="outlined"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => handleSetValue('name', e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Price"
                        variant="outlined"
                        fullWidth
                        value={formData.price}
                        onChange={(e) => handleSetValue('price', e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Description"
                        variant="outlined"
                        fullWidth
                        value={formData.description}
                        onChange={(e) => handleSetValue('description', e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Image URL"
                        variant="outlined"
                        fullWidth
                        value={formData.image}
                        onChange={(e) => handleSetValue('image', e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel id="category-label">Category</InputLabel>
                        <Select
                            labelId="category-label"
                            value={formData.category_id}
                            onChange={(e) =>
                                handleSetValue('category_id', e.target.value as string)
                            }
                            label="Category">
                            {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Quantity Avaliable"
                        variant="outlined"
                        fullWidth
                        value={formData.quantity}
                        onChange={(e) => handleSetValue('quantity', e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <ZelnakButton color="primary" type="submit" fullWidth>
                        {edit ? 'Edit Product' : 'Add Product'}
                    </ZelnakButton>
                </form>
                {message && (
                    <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                        {message}
                    </Typography>
                )}
            </ZelnakBox>
        </Layout>
    )
}

export default AddProduct
