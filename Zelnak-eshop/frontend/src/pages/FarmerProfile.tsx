import { Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { apiGet } from '../api/apiGet'
import { useCurrentUser } from '../context/CurrentUserContext'
import { Event } from '../types/Event'
import { Product } from '../types/Product'
import { User } from '../types/User'
import { HomepageEvents } from './Homepage/HomepageEvents'
import { HomepageProducts } from './Homepage/HomepageProducts'
import Layout from './layouts/Layout'
import ZelnakBox from './layouts/ZelnakBox'

const FarmerProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const [farmer, setFarmer] = useState<User | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [events, setEvents] = useState<Event[]>([])
    const [error, setError] = useState<string | null>(null)

    const { currentUser } = useCurrentUser()

    const isMyProfile = () => {
        if (!id) return false

        return currentUser?.id === parseInt(id, 10)
    }

    const [searchParams] = useSearchParams()

    const fetchFarmer = async () => {
        try {
            const response = await apiGet<User>(`/users/${id}`)
            setFarmer(response)
        } catch (err: any) {
            setError('Failed to fetch farmer profile')
        }
    }

    const fetchProducts = async () => {
        try {
            const response = await apiGet<Product[]>(`/users/${id}/products`)
            setProducts(response)
        } catch (err: any) {
            setError('Failed to fetch products')
        }
    }

    const fetchEvents = async () => {
        try {
            const response = await apiGet<Event[]>(`/users/${id}/events`)
            setEvents(response)
        } catch (err: any) {
            setError('Failed to fetch events')
        }
    }

    const handleUrlParams = () => {
        const category = searchParams.get('category')
        if (category) {
            setProducts(
                products.filter((product) => product.category_id === parseInt(category, 10))
            )
        }
    }

    useEffect(() => {
        fetchFarmer()
        fetchProducts()
        fetchEvents()
    }, [id])

    useEffect(() => {
        handleUrlParams()
    }, [searchParams, products])

    if (error) {
        return <Typography color="error">{error}</Typography>
    }

    if (!farmer) {
        return <Typography>Loading...</Typography>
    }

    return (
        <Layout>
            <ZelnakBox>
                <Typography variant="h2" component="h1" mb={3} sx={{ textAlign: 'center' }}>
                    Farmer name: {farmer.username}
                </Typography>
                <Typography variant="h2" component="div" mb={3} sx={{ textAlign: 'center' }}>
                    Farmer email: {farmer.email}
                </Typography>

                {/* Display Products */}
                {products.length > 0 && (
                    <HomepageProducts products={products} allowDelete={isMyProfile()} />
                )}
                {/* Display Events */}
                {events.length > 0 && (
                    <HomepageEvents
                        events={events}
                        users={[farmer]}
                        showAddButton={false}
                        allowDelete={isMyProfile()}
                    />
                )}
            </ZelnakBox>
        </Layout>
    )
}

export default FarmerProfile
