import { Router } from "express";

import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getBorrowingHistory,
  getBorrowingStats,
  getActivityDashboard,
} from "../controllers/users.controller.js";
import { authorizeAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.get("/", getUsers);

router.get("/:id", getUserById);
router.get("/:id/borrowing-history", getBorrowingHistory);
router.get("/:id/borrowing-stats", getBorrowingStats);
router.get("/:id/activity-dashboard", getActivityDashboard);

router.post("/", authorizeAdmin, createUser);

router.put("/:id", authorizeAdmin, updateUser);

router.delete("/:id", authorizeAdmin, deleteUser);

export default router;
