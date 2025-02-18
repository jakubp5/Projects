import {
  dbGetAllProducts,
  dbGetProductById,
  dbCreateProduct,
  dbUpdateProduct,
  dbDeleteProduct,
  dbGetProductsByUserId,
} from "../models/product.js";
import { dbGetUserById, dbUpdateUser } from "../models/user.js";
import { dbGetCategoryById } from "../models/category.js";
import { Roles } from "../enums/roles.js";
import { dbDeleteOrderItemsByProductId } from "../models/orderItem.js";

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await dbGetAllProducts();
    res.json(products);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to retrieve products: " + err.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await dbGetProductById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to retrieve product: " + err.message });
  }
};

// Get products by user ID
export const getProductsByUserId = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // test existence
    const existingUser = await dbGetUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Retrieve products by user_id
    const products = await dbGetProductsByUserId(userId);

    res.json(products);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to retrieve products: " + err.message });
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, user_id, image, category_id, quantity } =
      req.body;

    // Validate required fields
    if (
      !user_id ||
      !price ||
      !name ||
      !quantity ||
      !category_id ||
      name.trim().length === 0
    ) {
      return res.status(400).json({
        message: "Name, price, category,user_id and quantity are required",
      });
    }

    if (price < 0) {
      return res.status(400).json({ message: "Price has wrong value" });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity has wrong value" });
    }

    // Check if user exists
    const user = await dbGetUserById(user_id);
    if (!user) {
      return res.status(400).json({ message: "User ID doesn't exist" });
    }

    // Check if category exists
    const category = await dbGetCategoryById(category_id);
    if (!category) {
      return res.status(400).json({ message: "Category doesn't exist" });
    }

    // Set default image if not provided
    const imageUrl =
      image ||
      "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";

    // Create product
    const productCreated = await dbCreateProduct({
      name,
      price,
      description,
      user_id,
      image: imageUrl,
      category_id,
      seller_username: user.username,
      quantity,
    });

    if (productCreated) {
      // Check if user's current role is Registered
      if (user.role === Roles.Registered) {
        // Update user role to Farmer
        const roleUpdated = await dbUpdateUser(user_id, { role: Roles.Farmer });
        if (roleUpdated) {
          return res.status(201).json({
            message:
              "Product created successfully, user role updated to Farmer",
          });
        } else {
          return res.status(500).json({
            message:
              "Product created, but failed to update user role to Farmer",
          });
        }
      }

      res.status(201).json({ message: "Product created successfully" });
    } else {
      res.status(500).json({ message: "Failed to create product" });
    }
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to create product: " + err.message });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedProduct = {};

    // Check if any of the forbidden fields are included in the update request
    if (req.body.created_at || req.body.user_id) {
      return res
        .status(400)
        .json({ message: "Cannot update 'created_at' or 'user_id' fields" });
    }

    if (req.body.name) updatedProduct.name = req.body.name;
    if (req.body.price) updatedProduct.price = req.body.price;
    if (req.body.description) updatedProduct.description = req.body.description;
    if (req.body.image) updatedProduct.image = req.body.image;
    if (req.body.category_id) updatedProduct.category_id = req.body.category_id;
    if (req.body.quantity) updatedProduct.quantity = req.body.quantity;

    // Ensure that at least one valid field is provided for the update
    if (Object.keys(updatedProduct).length === 0) {
      return res
        .status(400)
        .json({ message: "At least one field is required to update" });
    }

    // Check if the product exists
    const existingProduct = await dbGetProductById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update the product in the database
    const productUpdated = await dbUpdateProduct(productId, updatedProduct);

    if (productUpdated) {
      res.json({ message: "Product updated successfully" });
    } else {
      res.status(500).json({ message: "Failed to update product" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update product: " + err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const existingProduct = await dbGetProductById(productId);

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the user is authorized to delete the event
    const userId = req.user.id; // The logged-in user's ID from the token
    const userRole = req.user.role; // The role from the token

    // Only allow the deletion if the user is an admin or the user who created the event
    if (userRole !== Roles.Admin && existingProduct.user_id !== userId) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to delete this product",
      });
    }

    // Delete related order items
    await dbDeleteOrderItemsByProductId(productId);

    // Proceed with deleting the product
    await dbDeleteProduct(productId);

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete product: " + err.message });
  }
};
