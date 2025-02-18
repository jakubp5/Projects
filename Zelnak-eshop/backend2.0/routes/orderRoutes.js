import { Router } from "express"
import {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrdersByUserId,
    getOrderItemsByOrderId,
    createOrderItem,
    updateOrderItem,
    deleteOrderItem,
    approveOrderItem,
    getOrderItemsBySellerId,
} from "../controllers/orderController.js"
import { Roles } from "../enums/roles.js"
import { authenticateToken } from "../middleware/auth.js"

const router = Router()

const permissions = {
    getAllOrders: [Roles.Admin],
    getOrderById: [Roles.Admin, Roles.Farmer, Roles.Customer],
    createOrder: [Roles.Admin, Roles.Customer, Roles.Registered],
    updateOrder: [Roles.Admin, Roles.Farmer, Roles.Customer],
    deleteOrder: [Roles.Admin, Roles.Farmer],
    getOrdersByUserId: [Roles.Admin, Roles.Farmer, Roles.Customer],
    createOrderItem: [Roles.Admin, Roles.Farmer, Roles.Registered, Roles.Customer],
    updateOrderItem: [Roles.Admin, Roles.Farmer, Roles.Registered, Roles.Customer],
    deleteOrderItem: [Roles.Admin, Roles.Farmer, Roles.Customer],
    getOrderItemsBySellerId: [Roles.Admin, Roles.Farmer, Roles.Customer],
    approveOrderItem: [Roles.Admin, Roles.Farmer],
    getOrderItemsByOrderId: [Roles.Admin, Roles.Farmer, Roles.Customer],
}

router.get("/", authenticateToken(permissions.getAllOrders), getAllOrders)
router.get("/:id", authenticateToken(permissions.getOrderById), getOrderById)
router.post("/", authenticateToken(permissions.createOrder), createOrder)
router.put("/:id", authenticateToken(permissions.updateOrder), updateOrder)
router.delete("/:id", authenticateToken(permissions.deleteOrder), deleteOrder)
router.get("/user/:id", authenticateToken(permissions.getOrdersByUserId), getOrdersByUserId)

router.post("/:orderId/items", authenticateToken(permissions.createOrderItem), createOrderItem)
router.get("/:orderId/items2", authenticateToken(permissions.getOrderItemsByOrderId), getOrderItemsByOrderId)
router.put("/items/:id", authenticateToken(permissions.updateOrderItem), updateOrderItem)
router.delete("/items/:id", authenticateToken(permissions.deleteOrderItem), deleteOrderItem)

router.get("/:sellerId/items", authenticateToken(permissions.getOrderItemsBySellerId), getOrderItemsBySellerId)
router.put("/items/:id/approve", authenticateToken(permissions.approveOrderItem), approveOrderItem)

export default router
