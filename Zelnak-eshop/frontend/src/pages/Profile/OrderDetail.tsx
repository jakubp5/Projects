import { Box, Paper, Typography } from '@mui/material'
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiGet } from '../../api/apiGet'
import { useAuth } from '../../context/AuthContext'
import { OrderStatus } from '../../enums/OrderStatus'
import { Order } from '../../types/Order'
import Layout from '../layouts/Layout'

const columnsEnum = {
    id: 'id',
    status: 'status',
    item: 'item',
    quantity: 'quantity',
}

const OrderDetail = () => {
    const { id } = useParams<{ id: string }>()
    const { authenticated, accessToken } = useAuth()
    const [orders, setOrder] = useState<Order[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const getOrder = async () => {
        if (!authenticated || !accessToken) return

        if (!id) {
            setError('No order id provided')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await apiGet<Order[]>(`/orders/${id}/items2`, accessToken)
            setOrder(response)
        } catch (error: any) {
            setError(error.message)
        }

        setLoading(false)
    }

    useEffect(() => {
        getOrder()
    }, [id])

    const apiRef = useGridApiRef()

    const columns: GridColDef<Order>[] = [
        {
            field: columnsEnum.id,
            width: 100,
            headerName: 'Product ID',
        },
        {
            field: columnsEnum.item,
            width: 160,
            headerName: 'Name',
            valueGetter: (_value, row: Order) => {
                return row.productName
            },
        },
        {
            field: columnsEnum.quantity,
            width: 160,
            headerName: 'Quantity',
            valueGetter: (_value, row: Order) => {
                return row.quantity
            },
        },
        {
            field: columnsEnum.status,
            width: 140,
            headerName: 'Status',
            sortable: false,
            renderCell: (params) => {
                const row = params.row as Order
                const status = OrderStatus[row.status]

                return status
            },
        },
    ]

    return (
        <Layout>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    my: 5,
                }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 3,
                        my: 5,
                    }}>
                    <Typography variant="h1" gutterBottom textAlign={'center'}>
                        Order Detail
                    </Typography>
                    <Paper elevation={3} sx={{ p: 3, width: '760px' }}>
                        <Box
                            component="fieldset"
                            sx={{
                                display: 'grid',
                                overflowX: 'auto',
                            }}>
                            {orders && (
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
                                                // [columnsEnum.accept]: showFarmerButtons,
                                            },
                                        },
                                    }}
                                    pageSizeOptions={[10]}
                                    checkboxSelection
                                    disableRowSelectionOnClick
                                    autoHeight // fix infinite expanding
                                    loading={loading}
                                />
                            )}
                        </Box>
                    </Paper>
                </Box>
            </Box>

            {error && (
                <Typography variant="body1" color="error">
                    {error}
                </Typography>
            )}
        </Layout>
    )

    // get orders by userid
}

export default OrderDetail
