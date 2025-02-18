import { User } from './User'

export interface Event {
    id: number
    name: string
    description: string
    date: string
    location: string
    user_id: User['id']
    created_at: string
}
