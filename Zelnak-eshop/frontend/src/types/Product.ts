import { Category } from './Category'
import { User } from './User'

export interface Product {
    id: number
    name: string
    price: number
    description: string
    quantity: number
    image: string
    user_id: User['id']
    category_id: Category['id']
    created_at: string
    username: string
}
