// backend2.0/controllers/categoryController.js
import {
  dbGetAllCategories,
  dbGetCategoryById,
  dbCreateCategory,
  dbGetCategoryHierarchy,
  dbToggleCategoryApproval,
} from "../models/category.js";
import { poolPromise, sql } from "../config/database.js";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await dbGetAllCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await dbGetCategoryById(req.params.id);
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCategory = async (req, res) => {
  // Check if the name is provided
  if (!req.body.name || req.body.name.trim() === "") {
    return res.status(400).json({
      message: "Category name is required",
    });
  }

  const newCategory = {
    name: req.body.name,
    parent_id: req.body.parent_id,
    is_approved: 0,
  };

  const attributes = req.body.attributes || []; // Default to empty array if no attributes

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    // Begin the transaction
    await transaction.begin();

    // Check if the category with the same name already exists
    const existingCategory = await transaction
      .request()
      .input("name", sql.NVarChar, newCategory.name)
      .query("SELECT COUNT(*) AS count FROM categories WHERE name = @name");

    if (existingCategory.recordset[0].count > 0) {
      return res.json({
        message: "Category name must be unique",
      });
    }

    // Create the category and get its ID
    const categoryId = await dbCreateCategory(newCategory, transaction);

    // Create attributes if provided
    if (attributes.length > 0) {
      for (let attribute of attributes) {
        await transaction
          .request()
          .input("name", sql.NVarChar, attribute.name)
          .input("is_required", sql.Bit, attribute.is_required)
          .input("category_id", sql.Int, categoryId).query(`
                        INSERT INTO attributes (name, is_required, category_id)
                        VALUES (@name, @is_required, @category_id)
                    `);
      }
    }

    // Commit the transaction after both operations
    await transaction.commit();

    // Return success response with category and its attributes
    res.json({
      message: "Category and attributes created successfully",
    });
  } catch (err) {
    // Rollback the transaction in case of any error
    await transaction.rollback();
    console.error("Error creating category and attributes:", err);
    res.status(500).json({
      message:
        "Failed to create category and attributes. Please try again later.",
    });
  }
};

export const toggleCategoryApproval = async (req, res) => {
  const categoryId = req.params.id;

  try {
    const category = await dbGetCategoryById(categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    const currentStatus = category.is_approved;
    const newStatus = currentStatus == 1 ? 0 : 1; // Toggle the status

    const success = await dbToggleCategoryApproval(categoryId, newStatus);

    if (!success) {
      res.json({ message: `Category approval status failed to update` });
    }

    res.json({
      message: `Category approval status updated successfully`,
      categoryId,
      is_approved: newStatus,
    });
  } catch (err) {
    // Rollback the transaction in case of any error
    console.error("Error toggling category approval status:", err);
    res.status(500).json({
      message:
        err.message ||
        "Failed to toggle category approval status. Please try again later.",
    });
  }
};

export const updateCategory = async (req, res) => {
  const categoryId = req.params.id;
  const updatedCategory = {
    name: req.body.name,
    parent_id: req.body.parent_id,
    is_approved: req.body.is_approved || 0, // Default false
  };

  const attributes = req.body.attributes || []; // Default to empty array

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    // Begin the transaction
    await transaction.begin();

    // Check if the name is unique (only if the name has changed)
    const existingCategory = await transaction
      .request()
      .input("name", sql.NVarChar, updatedCategory.name)
      .input("category_id", sql.Int, categoryId) // Exclude current category
      .query(`
                SELECT COUNT(*) AS count
                FROM categories
                WHERE name = @name AND id != @category_id
            `);

    if (existingCategory.recordset[0].count > 0) {
      throw new Error("Category name must be unique");
    }

    // Update the category
    const result = await transaction
      .request()
      .input("name", sql.NVarChar, updatedCategory.name)
      .input("parent_id", sql.Int, updatedCategory.parent_id)
      .input("is_approved", sql.Bit, updatedCategory.is_approved)
      .input("id", sql.Int, categoryId).query(`
                UPDATE categories
                SET name = @name, parent_id = @parent_id, is_approved = @is_approved
                WHERE id = @id
            `);

    // Update attributes if provided
    if (attributes.length > 0) {
      for (let attribute of attributes) {
        console.log(attribute);

        await transaction
          .request()
          .input("id", sql.Int, attribute.id)
          .input("name", sql.NVarChar, attribute.name)
          .input("is_required", sql.Bit, attribute.is_required)
          .input("category_id", sql.Int, categoryId).query(`
                        UPDATE attributes
                        SET name = @name, is_required = @is_required, category_id = @category_id
                        WHERE id = @id`);
      }
    }

    // Commit the transaction after both operations
    await transaction.commit();

    res.json({
      message: "Category and attributes updated successfully",
      category: {
        id: categoryId,
        name: updatedCategory.name,
        parent_id: updatedCategory.parent_id,
        is_approved: updatedCategory.is_approved,
        attributes: attributes,
      },
    });
  } catch (err) {
    // Rollback the transaction in case of any error
    await transaction.rollback();
    console.error("Error updating category and attributes:", err);
    res.status(500).json({
      message:
        err.message ||
        "Failed to update category and attributes. Please try again later.",
    });
  }
};

export const deleteCategory = async (req, res) => {
  const categoryId = req.params.id;
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    // Begin the transaction
    await transaction.begin();

    // Check if the category exists
    const category = await transaction
      .request()
      .input("id", sql.Int, categoryId)
      .query("SELECT * FROM categories WHERE id = @id");

    if (category.recordset.length === 0) {
      throw new Error("Category not found");
    }

    // Check if there are any subcategories
    const subcategories = await transaction
      .request()
      .input("parent_id", sql.Int, categoryId)
      .query("SELECT id FROM categories WHERE parent_id = @parent_id");

    if (subcategories.recordset.length > 0) {
      await transaction
        .request()
        .input("parent_id", sql.Int, null)
        .input("category_id", sql.Int, categoryId)
        .query(
          "UPDATE categories SET parent_id = @parent_id WHERE parent_id = @category_id"
        );
    }

    // Delete associated reviews for each product in this category
    const products = await transaction
      .request()
      .input("category_id", sql.Int, categoryId)
      .query("SELECT id FROM products WHERE category_id = @category_id");

    for (let product of products.recordset) {
      // Delete related reviews for each product
      await transaction
        .request()
        .input("product_id", sql.Int, product.id)
        .query("DELETE FROM reviews WHERE product_id = @product_id");
    }

    // Delete associated order_items for each product in this category
    for (let product of products.recordset) {
      await transaction
        .request()
        .input("product_id", sql.Int, product.id)
        .query("DELETE FROM order_items WHERE product_id = @product_id");
    }

    // Delete the products from the category
    await transaction
      .request()
      .input("category_id", sql.Int, categoryId)
      .query("DELETE FROM products WHERE category_id = @category_id");

    // Delete associated attributes
    await transaction
      .request()
      .input("category_id", sql.Int, categoryId)
      .query("DELETE FROM attributes WHERE category_id = @category_id");

    // Delete the category
    await transaction
      .request()
      .input("id", sql.Int, categoryId)
      .query("DELETE FROM categories WHERE id = @id");

    // Commit the transaction after all operations
    await transaction.commit();

    res.json({
      message:
        "Category, its attributes, associated products, reviews, and order items deleted successfully",
      categoryId,
    });
  } catch (err) {
    // Rollback the transaction in case of any error
    await transaction.rollback();
    console.error(
      "Error deleting category, attributes, products, reviews, and order items:",
      err
    );
    res.status(500).json({
      message:
        err.message ||
        "Failed to delete category, attributes, products, reviews, and order items. Please try again later.",
    });
  }
};

export const getCategoryHierarchy = async (req, res) => {
  try {
    const hierarchy = await dbGetCategoryHierarchy(req.params.categoryId);
    res.json(hierarchy);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
