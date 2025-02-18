import { Typography } from '@mui/material'

import { Order } from '../../types/Order'

import { Box } from '@mui/material'

import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid'
// import { useAuth } from '../../context/AuthContext'
// import { useCurrentUser } from '../../context/CurrentUserContext'
import { apiPut } from '../../api/apiPut'
import { ZelnakButton } from '../../components/ZelnakButton'
import { useAuth } from '../../context/AuthContext'
import { useCurrentUser } from '../../context/CurrentUserContext'
import { OrderStatus, OrderStatusEnum } from '../../enums/OrderStatus'

const columnsEnum = {
    id: 'id',
    productName: 'productName',
    status: 'status',
    approve: 'approve',
    quantity: 'quantity',
}

interface ProfileFarmerOrdersProps {
    orders: Order[]
    loading: boolean
}

const ProfileFarmerOrders = (props: ProfileFarmerOrdersProps) => {
    const { orders, loading } = props
    const { accessToken, authenticated } = useAuth()
    const { isFarmer } = useCurrentUser()

    const apiRef = useGridApiRef()

    const handleApprove = (orderId: number) => {
        if (!authenticated || !accessToken) return

        try {
            const body = { status: OrderStatusEnum.Approved }
            const response = apiPut<any>(`/orders/items/${orderId}/approve`, body, accessToken)
            console.log(response)
        } catch (err: any) {
            console.error('Failed to approve order', err)
        }
    }

    const columns: GridColDef<Order>[] = [
        {
            field: columnsEnum.id,
            width: 40,
            headerName: 'ID',
        },
        {
            field: columnsEnum.productName,
            width: 160,
            headerName: 'Product Name',
            renderCell: (params) => {
                return <div>{params.row.productName}</div>
            },
        },
        {
            field: columnsEnum.status,
            width: 100,
            headerName: 'Status',

            valueGetter: (_value, row: Order) => {
                return OrderStatus[row.status]
            },
        },
        {
            field: columnsEnum.quantity,
            width: 80,
            headerName: 'Quantity',
            valueGetter: (_value, row: Order) => {
                return row.quantity
            },
        },
        {
            field: columnsEnum.approve,
            width: 160,
            headerName: 'Approve',

            renderCell: (params) => {
                const row = params.row as Order
                const orderId = row.id

                const isAccepted = row.status === OrderStatusEnum.Approved

                return (
                    !isAccepted && (
                        <ZelnakButton variant="primary" onClick={() => handleApprove(orderId)}>
                            Approve
                        </ZelnakButton>
                    )
                )
            },
        },
    ]

    return (
        <>
            <Typography variant="h4" gutterBottom>
                Orders to approve
            </Typography>

            {/* <pre>{JSON.stringify(orders)}</pre> */}

            {orders.length && orders.length > 0 ? (
                <Box
                    component="fieldset"
                    sx={{
                        display: 'grid',
                        overflowX: 'auto',
                    }}>
                    <DataGrid
                        apiRef={apiRef}
                        density="standard"
                        sx={{}}
                        rows={orders}
                        columns={columns}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 10,
                                },
                            },
                            columns: {
                                columnVisibilityModel: {
                                    [columnsEnum.approve]: isFarmer ? true : false,
                                },
                            },
                        }}
                        pageSizeOptions={[10]}
                        checkboxSelection
                        disableRowSelectionOnClick
                        autoHeight // fix infinite expanding
                        loading={loading}
                    />
                </Box>
            ) : (
                <Typography variant="body1">No orders to approve</Typography>
            )}
        </>
    )
}

export default ProfileFarmerOrders
