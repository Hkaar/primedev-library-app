import { body } from "express-validator";

export const createBorrowingValidation = [
  body("userId")
    .isInt()
    .withMessage("User ID must be an integer")
    .notEmpty()
    .withMessage("User ID is required"),
  body("bookId")
    .isInt()
    .withMessage("Book ID must be an integer")
    .notEmpty()
    .withMessage("Book ID is required"),
];
