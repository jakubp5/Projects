import {
  dbGetAllOrders,
  dbGetOrderById,
  dbCreateOrder,
  dbUpdateOrder,
  dbDeleteOrder,
  dbGetOrdersByUserId,
} from "../models/order.js";
import {
  dbCreateOrderItem,
  dbGetOrderItemsByOrderId,
  dbUpdateOrderItem,
  dbGetOrderItemsBySellerId,
  dbGetOrderItemById,
} from "../models/orderItem.js";
import { poolPromise, sql } from "../config/database.js";
import {
  dbGetProductById,
  dbUpdateProductQuantity,
} from "../models/product.js";
import { dbGetUserById, dbUpdateUser } from "../models/user.js";
import { Roles } from "../enums/roles.js";

export const approveOrderItem = async (req, res) => {
  const { id } = req.params;

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    // Begin the transaction
    await transaction.begin();

    // Get the order item
    const orderItem = await dbGetOrderItemById(id);
    if (!orderItem) {
      await transaction.rollback();
      return res.status(404).json({ message: "Order item not found" });
    }

    // Get the product
    const product = await dbGetProductById(orderItem.product_id);
    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if there is enough quantity
    if (product.quantity < orderItem.quantity) {
      await transaction.rollback();
      return res.status(400).json({ message: "Not enough product quantity" });
    }

    // Update the product quantity
    const newQuantity = product.quantity - orderItem.quantity;
    await dbUpdateProductQuantity(
      orderItem.product_id,
      newQuantity,
      transaction
    );

    const status = "Approved";

    // Update the order item status
    await dbUpdateOrderItem(id, { status }, transaction);

    // Commit the transaction
    await transaction.commit();

    res.json({ message: "Order item approved successfully" });
  } catch (err) {
    // Rollback the transaction in case of any error
    await transaction.rollback();
    res
      .status(500)
      .json({ message: "Failed to approve order item: " + err.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await dbGetAllOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await dbGetOrderById(req.params.id);
    const orderItems = await dbGetOrderItemsByOrderId(req.params.id);
    res.json({ order, orderItems });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createOrder = async (req, res) => {
  const { buyer_id, products } = req.body;

  if (!buyer_id || !products || products.length === 0) {
    return res
      .status(400)
      .json({ message: "Buyer ID and products are required" });
  }

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // Create the order
    const newOrder = { buyer_id, status: "Pending" };
    const createdOrder = await dbCreateOrder(newOrder, transaction);

    // Create order items
    for (const product of products) {
      const newOrderItem = {
        order_id: createdOrder.id,
        product_id: product.product_id,
        seller_id: product.seller_id,
        quantity: product.quantity,
        status: "Pending",
      };
      await dbCreateOrderItem(newOrderItem, transaction);
    }

    await transaction.commit();

    const user = await dbGetUserById(buyer_id);
    if (user.role === Roles.Registered) {
      // Update user role to Customer
      const roleUpdated = await dbUpdateUser(buyer_id, {
        role: Roles.Customer,
      });
      if (roleUpdated) {
        return res.status(201).json({
          message: "Order created successfully, user role updated to Customer",
        });
      } else {
        return res.status(500).json({
          message: "Order created, but failed to update user role to Customer",
        });
      }
    }

    res
      .status(201)
      .json({ message: "Order created successfully", order: createdOrder });
  } catch (err) {
    // Rollback the transaction in case of any error
    await transaction.rollback();
    res.status(500).json({ message: "Failed to create order: " + err.message });
  }
};

export const updateOrder = async (req, res) => {
  const updatedOrder = {
    status: req.body.status,
  };

  try {
    await dbUpdateOrder(req.params.id, updatedOrder);
    res.json({ message: "Order updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    await dbDeleteOrder(req.params.id);
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrdersByUserId = async (req, res) => {
  try {
    const orders = await dbGetOrdersByUserId(req.params.id);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Order Items
export const createOrderItem = async (req, res) => {
  const { order_id, product_id, seller_id, quantity } = req.body;

  if (!order_id || !product_id || !seller_id || !quantity) {
    return res.status(400).json({
      message: "Order ID, Product ID, Seller ID, and Quantity are required",
    });
  }

  try {
    const newOrderItem = {
      order_id,
      product_id,
      seller_id,
      quantity,
      status: "Pending",
    };
    const createdOrderItem = await dbCreateOrderItem(newOrderItem);

    res.status(201).json({
      message: "Order item created successfully",
      orderItem: createdOrderItem,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create order item: " + err.message });
  }
};

export const updateOrderItem = async (req, res) => {
  const updatedOrderItem = {
    status: req.body.status,
  };

  try {
    await dbUpdateOrderItem(req.params.id, updatedOrderItem);
    res.json({ message: "Order item updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteOrderItem = async (req, res) => {
  try {
    await dbDeleteOrderItem(req.params.id);
    res.json({ message: "Order item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrderItemsByOrderId = async (req, res) => {
  try {
    const orderItems = await dbGetOrderItemsByOrderId(req.params.orderId);
    res.json(orderItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrderItemsBySellerId = async (req, res) => {
  try {
    const orderItems = await dbGetOrderItemsBySellerId(req.params.sellerId);
    res.json(orderItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
