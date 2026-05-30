import { Router } from "express";

import {
  getAllBorrowings,
  getBorrowingById,
  createBorrowing,
  returnBook,
  deleteBorrowing,
  getUpcomingDue,
} from "../controllers/borrowings.controller.js";
import { authorizeAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.get("/", getAllBorrowings);
router.get("/upcoming-due", authorizeAdmin, getUpcomingDue);
router.get("/:id", getBorrowingById);
router.post("/", authorizeAdmin, createBorrowing);
router.put("/return/:id", authorizeAdmin, returnBook);
router.delete("/:id", authorizeAdmin, deleteBorrowing);

export default router;
