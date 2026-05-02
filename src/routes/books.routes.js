import { Router } from "express";

import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/books.controller.js";

import {
  createBookValidation,
  updateBookValidation,
} from "../validations/book.validations.js";

import { authorizeAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.get("/", getBooks);

router.get("/:id", getBookById);

router.post("/", authorizeAdmin, createBookValidation, createBook);

router.put("/:id", authorizeAdmin, updateBookValidation, updateBook);

router.delete("/:id", authorizeAdmin, deleteBook);

export default router;
