export enum OrderStatusEnum {
    Pending = 'Pending',
    Approved = 'Approved',
    Rejected = 'Rejected',
    Finished = 'Finished',
}

export const OrderStatus: Record<OrderStatusEnum, string> = {
    [OrderStatusEnum.Pending]: 'Pending',
    [OrderStatusEnum.Approved]: 'Approved',
    [OrderStatusEnum.Rejected]: 'Rejected',
    [OrderStatusEnum.Finished]: 'Finished',
}
