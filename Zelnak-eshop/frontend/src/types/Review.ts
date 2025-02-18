import { Product } from './Product'
import { User } from './User'

export interface Review {
    id: number
    user_id: User['id']
    product_id: Product['id']
    rating: number
    review: string
    created_at: string
}
