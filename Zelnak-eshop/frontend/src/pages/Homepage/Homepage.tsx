import { Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiGet } from '../../api/apiGet'
import { useCurrentUser } from '../../context/CurrentUserContext'
import { Category } from '../../types/Category'
import { Event } from '../../types/Event'
import { Product } from '../../types/Product'
import { User } from '../../types/User'
import Layout from '../layouts/Layout'
import ZelnakBox from '../layouts/ZelnakBox'
import { HomepageCategories } from './HomepageCategories'
import { HomepageEvents } from './HomepageEvents'
import { HomepageProducts } from './HomepageProducts'

const Homepage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([])
    const [allProducts, setAllProducts] = useState<Product[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [events, setEvents] = useState<Event[]>([])
    const [users, setUsers] = useState<User[]>([])

    const [searchParams] = useSearchParams()

    const { isFarmer } = useCurrentUser()

    const fetchCategories = async () => {
        try {
            const response = await apiGet<Category[]>('/categories')
            const approvedCategories = response.filter((category) => category.is_approved)
            setCategories(approvedCategories)
        } catch (err: any) {
            console.error('Failed to fetch categories', err)
        }
    }

    const fetchAllProducts = async () => {
        try {
            const response = await apiGet<Product[]>('/products')
            setAllProducts(response)
            setProducts(response)
        } catch (err: any) {
            console.error('Failed to fetch products', err)
        }
    }

    const fetchEvents = async () => {
        try {
            const response = await apiGet<Event[]>('/events')
            setEvents(response)
        } catch (err: any) {
            console.error('Failed to fetch events', err)
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await apiGet<User[]>('/users')
            console.log(response)
            setUsers(response)
        } catch (err: any) {
            console.error('Failed to fetch users', err)
        }
    }

    const handleUrlParams = () => {
        const category = searchParams.get('category')
        if (category) {
            setProducts(
                allProducts.filter((product) => product.category_id === parseInt(category, 10))
            )
        } else {
            setProducts(allProducts)
        }
    }

    useEffect(() => {
        fetchCategories()
        fetchAllProducts()
        fetchEvents()
        fetchUsers()
    }, [])

    useEffect(() => {
        handleUrlParams()
    }, [searchParams, allProducts])

    return (
        <Layout>
            <Typography variant="h1" component="h1" mb={3} textAlign={'center'} mt={6}>
                Homepage
            </Typography>
            <ZelnakBox sx={{ width: '1080px' }} parentSx={{ py: 2 }}>
                <HomepageCategories categories={categories} />
            </ZelnakBox>
            <ZelnakBox sx={{ width: '1080px' }} parentSx={{ py: 2 }}>
                <HomepageProducts products={products} showAddButton={isFarmer} />
            </ZelnakBox>
            <ZelnakBox sx={{ width: '1080px' }} parentSx={{ py: 2 }}>
                <HomepageEvents events={events} users={users} showAddButton={isFarmer} />
            </ZelnakBox>
        </Layout>
    )
}

export default Homepage
