export interface Category {
    id: number
    name: string
    parent_id: number | null
    is_approved: boolean
}
