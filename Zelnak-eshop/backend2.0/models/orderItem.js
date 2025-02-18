import { poolPromise, sql } from "../config/database.js";

export const dbCreateOrderItem = async (orderItem, transaction) => {
  const result = await transaction
    .request()
    .input("order_id", sql.Int, orderItem.order_id)
    .input("product_id", sql.Int, orderItem.product_id)
    .input("seller_id", sql.Int, orderItem.seller_id)
    .input("quantity", sql.Int, orderItem.quantity)
    .input("status", sql.NVarChar, orderItem.status || "Pending").query(`
            INSERT INTO order_items (order_id, product_id, seller_id, quantity, status)
            OUTPUT Inserted.id
            VALUES (@order_id, @product_id, @seller_id, @quantity, @status)
        `);
  return result.recordset[0];
};

export const dbGetOrderItemById = async (id) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query("SELECT * FROM order_items WHERE id = @id");
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const dbGetOrderItemsByOrderId = async (orderId) => {
  const pool = await poolPromise;
  const result = await pool.request().input("orderId", sql.Int, orderId).query(`
            SELECT oi.*, p.name as productName
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = @orderId
        `);
  return result.recordset;
};

export const dbUpdateOrderItem = async (id, updatedOrderItem, transaction) => {
  const result = await transaction
    .request()
    .input("id", sql.Int, id)
    .input("status", sql.NVarChar, updatedOrderItem.status).query(`
            UPDATE order_items
            SET status = @status
            WHERE id = @id
        `);
  return result.rowsAffected[0] > 0;
};

export const dbDeleteOrderItem = async (id) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query("DELETE FROM order_items WHERE id = @id");
  return result.rowsAffected[0] > 0;
};

export const dbGetOrderItemsBySellerId = async (sellerId) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("sellerId", sql.Int, sellerId)
    .query("SELECT * FROM order_items WHERE seller_id = @sellerId");
  return result.recordset;
};

export const dbDeleteOrderItemsByProductId = async (productId) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("productId", sql.Int, productId)
    .query("DELETE FROM order_items WHERE product_id = @productId");
  return result.rowsAffected[0] > 0;
};
