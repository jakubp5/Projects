import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import api from '../api/api';
import { LocalStorage } from '../enums';

interface Event {
    id: number;
    name: string;
    description: string;
    date: string;
    location: string;
    user_id: number;
}

const Events: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [userEvents, setUserEvents] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/events');
                setEvents(response.data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch events');
            }
        };

        const fetchUserEvents = async () => {
            try {
                const userId = localStorage.getItem(LocalStorage.UserId);
                if (userId) {
                    const response = await api.get(`/users/${userId}/events`);
                    setUserEvents(response.data);
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch user events');
            }
        };

        fetchEvents();
        fetchUserEvents();
    }, []);

    const handleAddEvent = async (eventId: number) => {
        try {
            const userId = localStorage.getItem(LocalStorage.UserId);
            const token = localStorage.getItem(LocalStorage.token);
            if (userId && token) {
                await api.post(`/users/${userId}/events`, { eventId }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUserEvents([...userEvents, eventId]);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add event');
        }
    };

    const handleRemoveEvent = async (eventId: number) => {
        try {
            const userId = localStorage.getItem(LocalStorage.UserId);
            const token = localStorage.getItem(LocalStorage.token);
            if (userId && token) {
                await api.delete(`/users/${userId}/events`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    data: { eventId }
                });
                setUserEvents(userEvents.filter(id => id !== eventId));
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to remove event');
        }
    };

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" gutterBottom>
                Events
            </Typography>
            {error && <Typography color="error">{error}</Typography>}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {events.map((event) => (
                    <Card key={event.id} sx={{ maxWidth: 345 }}>
                        <CardContent>
                            <Typography variant="h5" component="div">
                                {event.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {event.description}
                            </Typography>
                            <Typography variant="subtitle1" color="primary">
                                Date: {new Date(event.date).toLocaleDateString()}
                            </Typography>
                            <Typography variant="subtitle1" color="primary">
                                Location: {event.location}
                            </Typography>
                            {userEvents.includes(event.id) ? (
                                <Button variant="contained" color="secondary" onClick={() => handleRemoveEvent(event.id)}>
                                    Remove from My Events
                                </Button>
                            ) : (
                                <Button variant="contained" color="primary" onClick={() => handleAddEvent(event.id)}>
                                    Add to My Events
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
};

export default Events;