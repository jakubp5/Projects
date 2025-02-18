import { Router } from "express";
import { Roles } from "../enums/roles.js";
import {
  createAttribute,
  updateAttribute,
  deleteAttribute,
  getAttributesByCategoryId,
} from "../controllers/attributeController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

const permissions = {
  createAttribute: [],
  updateAttribute: [Roles.Admin, Roles.Moderator],
  deleteAttribute: [Roles.Admin, Roles.Moderator],
  getAttributes: [],
};

// Route to create an attribute
router.post(
  "/",
  authenticateToken(permissions.createAttribute),
  createAttribute
);

// Route to update an attribute
router.put(
  "/:id",
  authenticateToken(permissions.updateAttribute),
  updateAttribute
);

router.get("/:categoryId", getAttributesByCategoryId);
// Route to delete an attribute
router.delete("/:id", deleteAttribute);

export default router;
