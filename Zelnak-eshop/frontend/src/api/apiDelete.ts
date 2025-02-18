import axios from 'axios'
import { getAuthHeaders } from './getAuthHeaders'

export async function apiDelete<T>(url: string, accessToken?: string): Promise<T> {
    const fullUrl = import.meta.env.VITE_API_URL + url
    return axios
        .delete<T>(fullUrl, {
            headers: getAuthHeaders(accessToken),
        })
        .then((response) => {
            return response.data
        })
        .catch((error) => {
            if (axios.isAxiosError(error)) {
                throw new Error(error.response?.data?.code || 'Internal error')
            } else {
                throw new Error('Internal error')
            }
        })
}
