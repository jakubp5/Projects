import { poolPromise, sql } from "../config/database.js";

export const dbGetAllProducts = async () => {
  const pool = await poolPromise;
  const result = await pool.request().query(`
    SELECT products.*, users.username 
    FROM products 
    JOIN users ON products.user_id = users.id
  `);
  //add usernames

  return result.recordset; // Returning the rows from the query
};

export const dbGetProductById = async (id) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("id", sql.Int, id) // Binding the id parameter
    .query("SELECT * FROM products WHERE id = @id");
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

// Get products by user_id
export const dbGetProductsByUserId = async (user_id) => {
  const pool = await poolPromise;

  try {
    const result = await pool
      .request()
      .input("user_id", sql.Int, user_id)
      .query("SELECT * FROM products WHERE user_id = @user_id");

    // Return the result if any products are found, else return an empty array
    return result.recordset.length > 0 ? result.recordset : [];
  } catch (err) {
    throw new Error("Failed to retrieve products by user ID: " + err.message);
  }
};

export const dbGetProductsByCategory = async (categoryId) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("categoryId", sql.Int, categoryId)
    .query("SELECT * FROM products WHERE category_id = @categoryId");
  return result.recordset; // Returning the rows from the query
};

export const dbCreateProduct = async (newProduct) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("name", sql.NVarChar, newProduct.name)
    .input("price", sql.Decimal, newProduct.price)
    .input("description", sql.NVarChar, newProduct.description)
    .input("user_id", sql.Int, newProduct.user_id)
    .input("category_id", sql.Int, newProduct.category_id)
    .input("image", sql.NVarChar, newProduct.image)
    .input("quantity", sql.Int, newProduct.quantity)
    .query(
      "INSERT INTO products (name, price, description, user_id, image, category_id, quantity) VALUES (@name, @price, @description, @user_id, @image, @category_id, @quantity); SELECT SCOPE_IDENTITY() AS id"
    );
  return { id: result.rowsAffected, ...newProduct }; // Returning the insertId and newProduct
};

export const dbUpdateProduct = async (id, updatedProduct) => {
  if (!id || Object.keys(updatedProduct).length === 0) {
    throw new Error(
      "Invalid input: ID and at least one field to update are required."
    );
  }

  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .input("name", sql.NVarChar, updatedProduct.name)
    .input("price", sql.Decimal, updatedProduct.price)
    .input("description", sql.NVarChar, updatedProduct.description)
    .input("image", sql.NVarChar, updatedProduct.image)
    .input("category_id", sql.Int, updatedProduct.category_id)
    .input("quantity", sql.Int, updatedProduct.quantity)
    .query(
      "UPDATE products SET name = @name, price = @price, description = @description, image = @image, category_id = @category_id, quantity = @quantity WHERE id = @id"
    );
  return result.rowsAffected > 0; // Returns true if rows were affected
};

export const dbDeleteProduct = async (id) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query("DELETE FROM products WHERE id = @id");
  return result.rowsAffected > 0; // Returns true if rows were affected
};

export const dbUpdateProductQuantity = async (id, quantity, transaction) => {
  const result = await transaction
    .request()
    .input("id", sql.Int, id)
    .input("quantity", sql.Int, quantity).query(`
            UPDATE products
            SET quantity = @quantity
            WHERE id = @id
        `);
  return result.rowsAffected[0] > 0;
};
