import { poolPromise, sql } from '../config/database.js';

export const dbGetAllOrders = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM orders');
    return result.recordset;
};

export const dbGetOrderById = async (id) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM orders WHERE id = @id');
    return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const dbCreateOrder = async (newOrder, transaction) => {
    const result = await transaction.request()
        .input('buyer_id', sql.Int, newOrder.buyer_id)
        .input('status', sql.NVarChar, newOrder.status || 'Pending')
        .query(
            'INSERT INTO orders (buyer_id, status) OUTPUT Inserted.id VALUES (@buyer_id, @status)'
        );
    return { id: result.recordset[0].id, ...newOrder };
};

export const dbUpdateOrder = async (id, updatedOrder) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input('id', sql.Int, id)
        .input('status', sql.NVarChar, updatedOrder.status)
        .query(
            'UPDATE orders SET status = @status WHERE id = @id'
        );
    return result.rowsAffected[0] > 0;
};

export const dbDeleteOrder = async (id) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input('id', sql.Int, id)
        .query('DELETE FROM orders WHERE id = @id');
    return result.rowsAffected[0] > 0;
};

export const dbGetOrdersByUserId = async (userId) => {
    const pool = await poolPromise;
    const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .query('SELECT * FROM orders WHERE buyer_id = @userId');
    return result.recordset;
};