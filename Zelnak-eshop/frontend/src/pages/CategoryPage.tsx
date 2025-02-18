import DeleteIcon from '@mui/icons-material/Delete'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Switch,
    TextField,
    Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiDelete } from '../api/apiDelete'
import { apiGet } from '../api/apiGet'
import { apiPut } from '../api/apiPut'
import { ZelnakButton } from '../components/ZelnakButton'
import { useAuth } from '../context/AuthContext'
import Layout from './layouts/Layout'
import ZelnakBox from './layouts/ZelnakBox'

interface Category {
    id: number
    name: string
    parent_id: number | null
    is_approved: boolean
}

interface Attribute {
    id: number
    name: string
    is_required: boolean
    category_id: number
}

const CategoriesPage: React.FC = () => {
    const navigate = useNavigate() // To navigate to other routes
    const [categories, setCategories] = useState<Category[]>([])
    const [attributes, setAttributes] = useState<Attribute[]>([])
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false) // Dialog open state
    const [editCategory, setEditCategory] = useState<Category | null>(null) // Category being edited
    const [editAttributes, setEditAttributes] = useState<Attribute[]>([]) // Attributes being edited
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null) // Category to delete
    const { accessToken } = useAuth()
    useEffect(() => {
        const fetchCategories = async () => {
            if (!accessToken) return

            try {
                const response = await apiGet<Category[]>('/categories')
                setCategories(response)
            } catch (err: any) {
                console.error('Failed to fetch categories', err)
            }
        }

        fetchCategories()
    }, [])

    useEffect(() => {
        if (selectedCategory !== null) {
            const fetchAttributes = async () => {
                try {
                    const response = await apiGet<Attribute[]>(`/attributes/${selectedCategory}`)
                    setAttributes(response)
                } catch (err: any) {
                    console.error('Failed to fetch attributes', err)
                }
            }

            fetchAttributes()
        }
    }, [selectedCategory])

    useEffect(() => {
        if (selectedCategory !== null) {
            const filteredAttributes = attributes.filter(
                (attr) => attr.category_id === selectedCategory
            )
            setEditAttributes(filteredAttributes) // Update the attributes array
        }
    }, [selectedCategory, attributes])

    const handleApprovalToggle = async (categoryId: number, currentApprovalStatus: boolean) => {
        if (!accessToken) return
        try {
            await apiPut(`/categories/${categoryId}/toggle`, {}, accessToken)
            setCategories((prevCategories) =>
                prevCategories.map((category) =>
                    category.id === categoryId
                        ? { ...category, is_approved: !currentApprovalStatus }
                        : category
                )
            )
        } catch (err: any) {
            console.error('Failed to update category approval', err)
        }
    }

    const handleDeleteCategory = async () => {
        if (!accessToken) return
        if (categoryToDelete) {
            try {
                await apiDelete(`/categories/${categoryToDelete.id}`, accessToken)
                setCategories((prevCategories) =>
                    prevCategories.filter((category) => category.id !== categoryToDelete.id)
                )
            } catch (err: any) {
                console.error('Failed to delete category', err)
            }
        }
        setDialogOpen(false)
        setCategoryToDelete(null)
    }

    const confirmDeleteCategory = (category: Category) => {
        setCategoryToDelete(category)
        setDialogOpen(true)
    }

    const handleDialogClose = () => {
        setDialogOpen(false)
        setCategoryToDelete(null)
        setEditCategory(null) // Close the edit dialog as well
        setEditAttributes([]) // Reset attributes
    }

    const handleEditCategory = (category: Category) => {
        setSelectedCategory(category.id) // Set selected category ID
        setEditCategory(category) // Set the category being edited
        setDialogOpen(true) // Open the dialog
    }

    const handleUpdateCategory = async () => {
        if (!accessToken) return
        if (editCategory) {
            try {
                const categoryData = {
                    name: editCategory.name,
                    is_approved: editCategory.is_approved,
                    parent_id: editCategory.parent_id,
                    attributes: editAttributes.map((attr) => ({
                        id: attr.id,
                        name: attr.name,
                        is_required: attr.is_required,
                    })),
                }

                await apiPut(`/categories/${editCategory.id}`, categoryData, accessToken)
                setCategories((prevCategories) =>
                    prevCategories.map((category) =>
                        category.id === editCategory.id
                            ? { ...category, ...categoryData }
                            : category
                    )
                )
                handleDialogClose() // Close dialog after update
                window.location.reload()
            } catch (err: any) {
                console.error('Failed to update category', err)
            }
        }
    }

    const handleAttributeChange = (index: number, key: string, value: string | boolean) => {
        const newAttributes = [...editAttributes]
        newAttributes[index] = { ...newAttributes[index], [key]: value }
        setEditAttributes(newAttributes)
    }

    return (
        <Layout>
            <ZelnakBox>
                <Typography variant="h4" gutterBottom>
                    Moderator page - Categories
                </Typography>

                {/* Add Category Button */}
                <ZelnakButton
                    color="primary"
                    onClick={() => navigate('/add-category')} // Navigate to Add Category page
                    sx={{ mb: 2 }}>
                    Add new Category
                </ZelnakButton>

                {/* headers */}
                <List
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid #ccc',
                        mb: 2,
                    }}>
                    <ListItemText primary="Category Name" />
                    <ListItemText primary="Is approved" />
                    <ListItemText primary="Delete category" />
                </List>

                <List>
                    {categories?.map((category) => (
                        <ListItem
                            key={category.id}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: '1px solid #ccc',
                            }}>
                            <ListItemText
                                primary={category.name}
                                onClick={() => handleEditCategory(category)} // Open the edit dialog on click
                                style={{ cursor: 'pointer' }}
                            />
                            <Switch
                                checked={category.is_approved}
                                onChange={() =>
                                    handleApprovalToggle(category.id, category.is_approved)
                                }
                                name="approvalToggle"
                                color="primary"
                            />
                            <IconButton
                                color="error"
                                onClick={() => confirmDeleteCategory(category)}
                                aria-label="delete"
                                sx={{ marginLeft: 2 }}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItem>
                    ))}
                </List>

                {/* Edit Category Dialog */}
                <Dialog open={dialogOpen} onClose={handleDialogClose}>
                    <DialogTitle>Edit Category</DialogTitle>
                    <DialogContent>
                        {editCategory && (
                            <Box>
                                <TextField
                                    label="Category Name"
                                    variant="outlined"
                                    fullWidth
                                    value={editCategory.name}
                                    onChange={(e) =>
                                        setEditCategory({ ...editCategory, name: e.target.value })
                                    }
                                    sx={{ mb: 2 }}
                                />
                                <Typography variant="body1" gutterBottom>
                                    Approval Status:
                                </Typography>
                                <Switch
                                    checked={editCategory.is_approved}
                                    onChange={(e) =>
                                        setEditCategory({
                                            ...editCategory,
                                            is_approved: e.target.checked,
                                        })
                                    }
                                    name="approvalToggle"
                                    color="primary"
                                />
                                <Typography variant="h6" gutterBottom>
                                    Attributes
                                </Typography>
                                {editAttributes.map((attribute, index) => (
                                    <Box
                                        key={index}
                                        sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
                                            value={attribute.is_required ? 'true' : 'false'}
                                            onChange={(e) =>
                                                handleAttributeChange(
                                                    index,
                                                    'is_required',
                                                    e.target.value === 'true'
                                                )
                                            }
                                            sx={{ mr: 2 }}>
                                            <option value="true">Yes</option>
                                            <option value="false">No</option>
                                        </TextField>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDialogClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateCategory} color="primary">
                            Update
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={categoryToDelete !== null} onClose={handleDialogClose}>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete the category "{categoryToDelete?.name}"?
                            This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDialogClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteCategory} color="error">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </ZelnakBox>
        </Layout>
    )
}

export default CategoriesPage
