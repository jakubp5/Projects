// backend2.0/controllers/attributeController.js
import {
  dbCreateAttribute,
  dbGetAttributesByCategoryId,
} from "../models/attribute.js";

// Create a new attribute
export const createAttribute = async (req, res) => {
  const newAttribute = {
    name: req.body.name,
    is_required: req.body.is_required,
    category_id: req.body.category_id,
  };
  try {
    const attribute = await dbCreateAttribute(newAttribute);
    res.json({ message: "Attribute created successfully", attribute });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update an existing attribute
export const updateAttribute = async (req, res) => {
  const attributeId = req.params.id;
  const updatedAttribute = req.body;

  try {
    const result = await dbUpdateAttribute(attributeId, updatedAttribute);
    res.json({ message: "Attribute updated successfully", attribute: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete an attribute
export const deleteAttribute = async (req, res) => {
  const attributeId = req.params.id;

  try {
    const result = await dbDeleteAttribute(attributeId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all attributes
export const getAllAttributes = async (req, res) => {
  try {
    const categoryId = req.body.category_id;
    const attributes = await dbGetAttributesByCategoryId(categoryId);
    res.json(attributes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get attributes by category ID
export const getAttributesByCategoryId = async (req, res) => {
  try {
    const attributes = await dbGetAttributesByCategoryId(req.params.categoryId);
    res.json(attributes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
