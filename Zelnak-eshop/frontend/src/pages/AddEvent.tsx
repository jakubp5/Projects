import { TextField, Typography } from '@mui/material'
import { FormEvent, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiGet } from '../api/apiGet'
import { apiPost } from '../api/apiPost'
import { apiPut } from '../api/apiPut'
import { ZelnakButton } from '../components/ZelnakButton'
import { useAuth } from '../context/AuthContext'
import { useCurrentUser } from '../context/CurrentUserContext'
import { Event } from '../types/Event'
import Layout from './layouts/Layout'
import ZelnakBox from './layouts/ZelnakBox'

interface AddEventProps {
    edit?: boolean
}

interface FormData {
    name: string
    description: string
    date: string
    location: string
    user_id: number
}

const emptyFormData = {
    name: '',
    description: '',
    date: '',
    location: '',
    user_id: 0,
}

const formatDateForInput = (isoDate: string) => {
    const date = new Date(isoDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day}T${hours}:${minutes}`
}

const formatDateTimeForApi = (date: string) => {
    const dateObj = new Date(date)
    return dateObj.toISOString()
}

const AddEvent = (props: AddEventProps) => {
    const { edit = false } = props

    const { id } = useParams<{ id: string }>()

    const getEventById = async (id: string) => {
        try {
            const response = await apiGet<Event>(`/events/${id}`)
            console.log(response)

            setFormData({
                name: response.name,
                description: response.description,
                date: formatDateForInput(response.date),
                location: response.location,
                user_id: response.user_id,
            })
        } catch (error: any) {
            console.error('Failed to fetch event', error)
        }
    }

    useEffect(() => {
        if (edit && id) {
            getEventById(id)
        }
    }, [edit, id])

    const [formData, setFormData] = useState<FormData>(emptyFormData)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const { currentUser } = useCurrentUser()
    const { accessToken } = useAuth()

    const handleSetValue = (key: keyof typeof formData, value: string) => {
        setFormData({ ...formData, [key]: value })
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!accessToken || !currentUser) {
            setMessage('User is not authenticated')
            return
        }

        setMessage('')
        setLoading(true)
        setError(null)

        try {
            formData.user_id = currentUser?.id
            formData.date = formatDateTimeForApi(formData.date)

            const response = !edit
                ? await apiPost<any>('/events', formData, accessToken)
                : await apiPut<any>(`/events/${id}`, formData, accessToken)
            setMessage(response.message || 'Event added successfully!')
            setLoading(false)
            edit && id && getEventById(id)
        } catch (error: any) {
            console.log(error.message)
            setError(error.message)
            setLoading(false)
        }
    }

    return (
        <Layout>
            <ZelnakBox>
                <Typography variant="h4" component="h1" gutterBottom>
                    {edit ? 'Edit Event' : 'Add Event'}
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
                        label="Description"
                        variant="outlined"
                        fullWidth
                        value={formData.description}
                        onChange={(e) => handleSetValue('description', e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Date"
                        variant="outlined"
                        type="datetime-local"
                        fullWidth
                        value={formData.date}
                        onChange={(e) => handleSetValue('date', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Location"
                        variant="outlined"
                        fullWidth
                        value={formData.location}
                        onChange={(e) => handleSetValue('location', e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <ZelnakButton color="primary" type="submit" fullWidth disabled={loading}>
                        {edit ? 'Edit Event' : 'Add Event'}
                    </ZelnakButton>
                </form>
                {message && (
                    <Typography color="success.main" sx={{ mt: 2, textAlign: 'center' }}>
                        {message}
                    </Typography>
                )}
                {error && (
                    <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                        {error}
                    </Typography>
                )}
            </ZelnakBox>
        </Layout>
    )
}

export default AddEvent
