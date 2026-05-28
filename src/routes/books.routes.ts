import { Router } from "express";

import multer from "multer";

import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/books.controller.js";

const upload = multer({ storage: multer.memoryStorage() });

import {
  createBookValidation,
  updateBookValidation,
} from "../validations/book.validations.js";

import { authorizeAdmin } from "@/src/middlewares/admin.middleware.js";

const router = Router();

router.get("/", getBooks);

router.get("/:id", getBookById);

router.post(
  "/",
  authorizeAdmin,
  createBookValidation,
  upload.single("cover"),
  createBook,
);

router.put(
  "/:id",
  authorizeAdmin,
  updateBookValidation,
  upload.single("cover"),
  updateBook,
);

router.delete("/:id", authorizeAdmin, deleteBook);

export default router;
