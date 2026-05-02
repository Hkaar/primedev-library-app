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

const router = Router();

router.get("/", getBooks);

router.get("/:id", getBookById);

router.post("/", createBookValidation, createBook);

router.put("/:id", updateBookValidation, updateBook);

router.delete("/:id", deleteBook);

export default router;
