import { OrderStatusEnum } from '../enums/OrderStatus'

export interface Order {
    id: number
    seller_id: number
    buyer_id: number
    product_id: number
    quantity: number
    created_at: string
    status: OrderStatusEnum
    productName?: string
}
