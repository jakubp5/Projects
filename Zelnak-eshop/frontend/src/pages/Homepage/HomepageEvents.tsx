import { Box, Card, CardActionArea, CardContent, CircularProgress, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiDelete } from '../../api/apiDelete'
import { apiGet } from '../../api/apiGet'
import { apiPost } from '../../api/apiPost'
import { ZelnakButton } from '../../components/ZelnakButton'
import { useAuth } from '../../context/AuthContext'
import { useCurrentUser } from '../../context/CurrentUserContext'
import { Routes } from '../../enums'
import colors from '../../styles/colors'
import { Event } from '../../types/Event'
import { User } from '../../types/User'
import { formatDate } from '../../utils/myUtils'

interface HomepageEventsProps {
    events: Event[]
    users: User[]
    showAddButton?: boolean // Add the parameter to show/hide the "Create New Event" button
    allowDelete?: boolean
}

export const HomepageEvents: React.FC<HomepageEventsProps> = ({
    events,
    users,
    showAddButton = true,
    allowDelete = false,
}) => {
    const { authenticated, userId, accessToken } = useAuth()
    const { isFarmer } = useCurrentUser()

    const [userRegisteredEvents, setUserRegisteredEvents] = useState<Event[]>([])
    const [eventMessage, setEventMessage] = useState<{ productId: number; message: string } | null>(
        null
    )

    const fetchUserEvents = async () => {
        if (!authenticated || !accessToken) return

        try {
            const response = await apiGet<number[]>(
                `/users/${userId}/registeredevents`,
                accessToken
            )
            const userEvents = events.filter((event) => response.includes(event.id))
            setUserRegisteredEvents(userEvents)
        } catch (err: any) {
            console.error('Failed to fetch user events', err)
        }
    }

    const signUpForEvent = async (eventId: number) => {
        if (!authenticated || !accessToken) return

        try {
            const response = await apiPost<any>(`/users/${userId}/events`, { eventId }, accessToken)
            console.log(response)
            // Update the state to reflect the new event registration
            setUserRegisteredEvents((prevEvents) => [
                ...prevEvents,
                events.find((event) => event.id === eventId)!,
            ])
        } catch (err: any) {
            console.error('Failed to add event', err)
        }
    }

    const signOffFromEvent = async (eventId: number) => {
        if (!authenticated || !accessToken) return

        try {
            const response = await apiDelete<any>(`/users/${userId}/events/${eventId}`, accessToken)
            console.log(response)
            // Update the state to reflect the event removal
            setUserRegisteredEvents((prevEvents) =>
                prevEvents.filter((event) => event.id !== eventId)
            )
        } catch (err: any) {
            console.error('Failed to remove event', err)
        }
    }

    const getNameOfUserById = (userId: number) => {
        const user = users.find((user) => user.id === userId)
        return user ? user.username : 'Unknown'
    }

    const isUserRegisteredForEvent = (eventId: number) => {
        return userRegisteredEvents.some((event) => event.id === eventId)
    }

    useEffect(() => {
        if (events.length) {
            fetchUserEvents()
        }
    }, [events])

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

    const deleteEvent = async (eventId: number) => {
        if (!accessToken || !authenticated) return

        setDeleteError(null)
        setEventMessage(null)
        setDeleteLoading(true)

        try {
            setDeleteLoading(true)
            await apiDelete<any>(`/events/${eventId}`, accessToken)
            setDeleteLoading(false)
            setEventMessage({ productId: eventId, message: 'Product deleted' })
            setTimeout(() => {
                setEventMessage(null)
            }, 3000)
            window.location.reload()
        } catch (error: any) {
            console.log('Failed to delete product', error)
            setDeleteError({
                productId: eventId,
                message: error.message,
            })
            setDeleteLoading(false)
        }
    }

    return (
        <>
            <Typography variant="h1" component="h2" mb={3} textAlign="center">
                Self-harvest events
            </Typography>
            <Box
                className="all-events"
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 2,
                    mb: 5,
                }}>
                {events.map((event, index) => (
                    <Card key={index}>
                        <CardContent>
                            <CardActionArea>
                                <Link
                                    to={`${Routes.Events}/${event.id}`}
                                    style={{ textDecoration: 'none' }}>
                                    <Typography
                                        gutterBottom
                                        variant="h5"
                                        component="h4"
                                        sx={{ color: colors.colorText }}>
                                        {event.name}
                                    </Typography>
                                </Link>
                            </CardActionArea>
                            <Typography variant="body2" sx={{ color: colors.colorText }}>
                                {event.description}
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.colorText }}>
                                Date: {formatDate(event.date)}
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.colorText }}>
                                Location: {event.location}
                            </Typography>
                            <Typography variant="body2" sx={{ color: colors.colorText }} mb={2}>
                                Host:&nbsp;
                                <Link to={`${Routes.Seller}/${event.user_id}`}>
                                    {getNameOfUserById(event.user_id)}
                                </Link>
                            </Typography>
                            {authenticated ? (
                                <>
                                    {isUserRegisteredForEvent(event.id) ? (
                                        <ZelnakButton
                                            color="primary"
                                            sx={{
                                                mt: 'auto',
                                            }}
                                            onClick={() => signOffFromEvent(event.id)}
                                            fullWidth>
                                            Remove from my events
                                        </ZelnakButton>
                                    ) : (
                                        <ZelnakButton
                                            onClick={() => signUpForEvent(event.id)}
                                            color="secondary"
                                            sx={{
                                                mt: 'auto',
                                            }}
                                            disabled={isFarmer}
                                            fullWidth>
                                            Add to my events
                                        </ZelnakButton>
                                    )}
                                </>
                            ) : (
                                <Typography variant="body2" sx={{ color: colors.colorText }}>
                                    Pro zápis na událost se musíte přihlásit
                                </Typography>
                            )}

                            {allowDelete && (
                                <ZelnakButton
                                    onClick={() => {
                                        deleteEvent(event.id)
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
                                        'Delete event'
                                    )}
                                </ZelnakButton>
                            )}

                            {allowDelete && (
                                <Link
                                    to={`${Routes.EditEvent}/${event.id}`}
                                    style={{ textDecoration: 'none' }}>
                                    <ZelnakButton
                                        color="primary"
                                        sx={{
                                            mt: 1,
                                        }}
                                        fullWidth>
                                        Edit event
                                    </ZelnakButton>
                                </Link>
                            )}

                            {eventMessage?.productId === event.id && (
                                <Typography color="success" sx={{ mt: 2 }} textAlign={'center'}>
                                    {eventMessage.message} abc
                                </Typography>
                            )}

                            {deleteError && deleteError.productId === event.id && (
                                <Typography color="error" sx={{ mt: 2 }} textAlign={'center'}>
                                    {deleteError.message}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {showAddButton && (
                <Link to={Routes.AddEvent} style={{ textDecoration: 'none' }}>
                    <ZelnakButton
                        sx={{
                            display: 'block',
                            margin: 'auto',
                        }}>
                        Create New Event
                    </ZelnakButton>
                </Link>
            )}
        </>
    )
}
