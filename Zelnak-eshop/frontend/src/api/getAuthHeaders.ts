export const getAuthHeaders = (token?: string) => ({
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
})
