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
import {
  createUserValidation,
  updateUserValidation,
} from "../validations/user.validations.js";
import { authorizeAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.get("/", getUsers);

router.get("/:id", getUserById);
router.get("/:id/borrowing-history", getBorrowingHistory);
router.get("/:id/borrowing-stats", getBorrowingStats);
router.get("/:id/activity-dashboard", getActivityDashboard);

router.post("/", authorizeAdmin, createUserValidation, createUser);

router.put("/:id", authorizeAdmin, updateUserValidation, updateUser);

router.delete("/:id", authorizeAdmin, deleteUser);

export default router;
