// frontend/src/pages/AddCategory.tsx
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material'
import { Box, IconButton, MenuItem, TextField, Typography } from '@mui/material'
import React, { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet } from '../api/apiGet'
import { apiPost } from '../api/apiPost'
import { ZelnakButton } from '../components/ZelnakButton'
import { useAuth } from '../context/AuthContext'
import { useCurrentUser } from '../context/CurrentUserContext'
import { Routes } from '../enums'
import { wait } from '../utils/myUtils'
import Layout from './layouts/Layout'
import ZelnakBox from './layouts/ZelnakBox'

interface Category {
    id: number
    name: string
}

interface Attributes {
    name: string
    is_required: boolean
}

interface Request {
    name: string
    parent_id: number
    attributes: Attributes[]
}

const AddCategory: React.FC = () => {
    const [categoryName, setCategoryName] = useState('')
    const [parentCategoryId, setParentCategoryId] = useState<number | null>(null)
    const [attributes, setAttributes] = useState([{ name: '', isRequired: false }])
    const [categories, setCategories] = useState<Category[]>([])
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const { accessToken } = useAuth()
    const { isModerator } = useCurrentUser()

    const navigate = useNavigate()

    useEffect(() => {
        const fetchCategories = async () => {
            if (!accessToken) return

            try {
                const response = await apiGet<Category[]>('/categories', accessToken)
                setCategories(response)
            } catch (err: any) {
                console.error('Failed to fetch categories', err)
            }
        }

        fetchCategories()
    }, [])

    const handleAttributeChange = (index: number, key: string, value: string | boolean) => {
        const newAttributes = [...attributes]
        newAttributes[index] = { ...newAttributes[index], [key]: value }
        setAttributes(newAttributes)
    }

    const handleAddAttribute = () => {
        setAttributes([...attributes, { name: '', isRequired: false }])
    }

    const handleRemoveAttribute = (index: number) => {
        const newAttributes = attributes.filter((_, i) => i !== index)
        setAttributes(newAttributes)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!accessToken) return

        setLoading(true)
        setError(null)

        // Creating the data in the desired format
        const categoryData: Request = {
            name: categoryName,
            parent_id: parentCategoryId || 0,
            attributes: attributes.map((attr) => ({
                name: attr.name,
                is_required: attr.isRequired,
            })),
        }

        try {
            const response = await apiPost<any>('/categories', categoryData, accessToken)
            setMessage(response.message || 'Category created successfully!')
            setLoading(false)
            setError(null)
            if (isModerator) {
                await wait(1000).then(() => navigate(Routes.Categories))
            } else {
                await wait(1000).then(() => navigate(Routes.Profile))
            }
        } catch (error: any) {
            setError(error.message || 'Error occurred')
            setMessage('')
            setLoading(false)
        }
    }

    return (
        <Layout>
            <ZelnakBox>
                <Typography variant="h4" component="h1" gutterBottom>
                    Add Category
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Category Name"
                        variant="outlined"
                        fullWidth
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Parent Category"
                        variant="outlined"
                        fullWidth
                        select
                        value={parentCategoryId || ''}
                        onChange={(e) =>
                            setParentCategoryId(e.target.value ? parseInt(e.target.value) : null)
                        }
                        sx={{ mb: 2 }}>
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                                {category.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Typography variant="h6" gutterBottom>
                        Attributes
                    </Typography>
                    {attributes.map((attribute, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <TextField
                                label="Attribute Name"
                                variant="outlined"
                                fullWidth
                                value={attribute.name}
                                onChange={(e) =>
                                    handleAttributeChange(index, 'name', e.target.value)
                                }
                                sx={{ mr: 2 }}
                            />
                            <TextField
                                label="Required"
                                variant="outlined"
                                fullWidth
                                select
                                SelectProps={{ native: true }}
                                value={attribute.isRequired ? 'true' : 'false'}
                                onChange={(e) =>
                                    handleAttributeChange(
                                        index,
                                        'isRequired',
                                        e.target.value === 'true'
                                    )
                                }
                                sx={{ mr: 2 }}>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </TextField>
                            <IconButton onClick={() => handleRemoveAttribute(index)}>
                                <RemoveCircleOutline />
                            </IconButton>
                        </Box>
                    ))}
                    <ZelnakButton
                        onClick={handleAddAttribute}
                        startIcon={<AddCircleOutline />}
                        sx={{ mb: 2 }}>
                        Add Attribute
                    </ZelnakButton>
                    <ZelnakButton color="primary" type="submit" fullWidth disabled={loading}>
                        Add Category
                    </ZelnakButton>
                </form>
                {message && (
                    <Typography color="success.main" sx={{ mt: 2 }} textAlign={'center'}>
                        {message}
                    </Typography>
                )}
                {error && (
                    <Typography color="error" sx={{ mt: 2 }} textAlign={'center'}>
                        {error}
                    </Typography>
                )}
            </ZelnakBox>
        </Layout>
    )
}

export default AddCategory
