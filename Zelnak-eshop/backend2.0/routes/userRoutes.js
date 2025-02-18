// /routes/userRoutes.js

import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
  addUserEvent,
  removeUserEvent,
  getUserEvents,
} from "../controllers/userController.js";
import { getProductsByUserId } from "../controllers/productController.js";
import { getEventsByUserId } from "../controllers/eventController.js";
import { Roles } from "../enums/roles.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

const permissions = {
  updateUser: [],
  deleteUser: [Roles.Admin],
  addUserEvent: [Roles.Customer, Roles.Registered],
  removeUserEvent: [Roles.Customer, Roles.Registered],
};

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", authenticateToken(permissions.deleteUser), deleteUser);
router.post("/:userId/events", addUserEvent);
router.delete(
  "/:userId/events/:eventId",
  authenticateToken(permissions.removeUserEvent),
  removeUserEvent
);
router.get("/:userId/registeredevents", getUserEvents);
router.get("/:id/events", getEventsByUserId);
router.get("/:id/products", getProductsByUserId);

export default router;
