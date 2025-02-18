// backend2.0/routes/categoryRoutes.js
import { Router } from "express";
import { Roles } from "../enums/roles.js";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  getCategoryHierarchy,
  updateCategory,
  deleteCategory,
  toggleCategoryApproval,
} from "../controllers/categoryController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

const permissions = {
  createCategory: [
    Roles.Admin,
    Roles.Moderator,
    Roles.Customer,
    Roles.Registered,
  ],
  updateCategory: [Roles.Admin, Roles.Moderator],
  deleteCategory: [Roles.Admin, Roles.Moderator],
  toggleApproval: [Roles.Admin, Roles.Moderator],
};

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.put(
  "/:id",
  authenticateToken(permissions.updateCategory),
  updateCategory
);
router.put(
  "/:id/toggle",
  authenticateToken(permissions.toggleApproval),
  toggleCategoryApproval
);
router.post("/", authenticateToken(permissions.createCategory), createCategory);
router.delete(
  "/:id",
  authenticateToken(permissions.deleteCategory),
  deleteCategory
);
router.get("/:categoryId/hierarchy", getCategoryHierarchy);

export default router;
