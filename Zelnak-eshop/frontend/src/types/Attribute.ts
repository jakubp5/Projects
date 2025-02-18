import { Category } from './Category'

export interface Attribute {
    id: number
    name: string
    is_required: boolean
    category_id: Category['id']
}
