import { Typography } from '@mui/material'

import { Order } from '../../types/Order'

import { Box } from '@mui/material'

import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid'
import { Link } from 'react-router-dom'
import { Routes } from '../../enums'
// import { useAuth } from '../../context/AuthContext'
// import { useCurrentUser } from '../../context/CurrentUserContext'
import { ZelnakButton } from '../../components/ZelnakButton'
import { OrderStatus } from '../../enums/OrderStatus'
import { formatDateTime } from '../../utils/myUtils'

// tudle stranku muze videt jen customer pac to je jeho objednavka
// ZAKAZNIK uvidi vsechny tri polozky se stavy a az budou vsecky accepted objecvka je accepted
// farmer uvidi order items ktery se ho tykaj - getorderitembysellerid

/**
customer - zobrazit vsechny objednavky -
router.get("/user/:id", getOrdersByUserId);
customer - detail objednavky
router.get("/:orderId/items", getOrderItemsByOrderId);

//farmar
getorderitemsbysellerid - zobrazeni vsech polozek, ktore ma na starosti
router.put("/items/:id/approve", approveOrderItem);
router.put("/items/:id/approve", approveOrderItem); - body {
	status: SattusEnum
}
router.get("/:sellerId/items/", getOrderItemsBySellerId);
 */

const columnsEnum = {
    id: 'id',
    detail: 'detail',
    status: 'status',
    created_at: 'created_at',
}

interface ProfileOrdersProps {
    orders: Order[]
    loading: boolean
}

const ProfileOrders = (props: ProfileOrdersProps) => {
    const { orders, loading } = props

    const apiRef = useGridApiRef()

    const columns: GridColDef<Order>[] = [
        {
            field: columnsEnum.id,
            width: 40,
            headerName: 'ID',
        },
        {
            field: columnsEnum.detail,
            width: 140,
            headerName: 'Detail',

            sortable: false,
            renderCell: (params) => {
                return (
                    <Link to={`${Routes.Orders}/${params.row?.id}`}>
                        <ZelnakButton variant="primary">Detail</ZelnakButton>
                    </Link>
                )
            },
        },
        {
            field: columnsEnum.status,
            width: 160,
            headerName: 'Status',

            valueGetter: (_value, row: Order) => {
                return OrderStatus[row.status]
            },
        },
        {
            field: columnsEnum.created_at,
            width: 160,
            headerName: 'Created at',

            valueGetter: (_value, row: Order) => {
                return formatDateTime(row.created_at)
            },
        },
    ]

    return (
        <>
            <Typography variant="h4" gutterBottom>
                My orders
            </Typography>

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
            </Box>
        </>
    )
}

export default ProfileOrders
