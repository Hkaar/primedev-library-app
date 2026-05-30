import { body } from "express-validator";

export const reviewValidation = [
  body("bookId")
    .isInt()
    .withMessage("Book ID must be an integer")
    .notEmpty()
    .withMessage("Book ID is required"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5")
    .notEmpty()
    .withMessage("Rating is required"),
  body("comment")
    .isString()
    .withMessage("Comment must be a string")
    .notEmpty()
    .withMessage("Comment cannot be empty"),
];
