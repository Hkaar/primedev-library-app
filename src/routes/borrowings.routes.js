import { Router } from "express";

import {
  getAllBorrowings,
  getBorrowingById,
  createBorrowing,
  returnBook,
  deleteBorrowing,
} from "../controllers/borrowings.controller.js";

const router = Router();

router.get("/", getAllBorrowings);
router.get("/:id", getBorrowingById);
router.post("/", createBorrowing);
router.put("/:id", returnBook);
router.delete("/:id", deleteBorrowing);

export default router;
