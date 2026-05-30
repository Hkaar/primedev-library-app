import { body } from "express-validator";

export const createProfileValidation = [
  body("userId")
    .isInt()
    .withMessage("User ID must be an integer")
    .notEmpty()
    .withMessage("User ID is required"),
  body("address")
    .optional()
    .isString()
    .withMessage("Address must be a string"),
  body("phone")
    .optional()
    .isString()
    .withMessage("Phone must be a string"),
];

export const updateProfileValidation = [
  body("address")
    .optional()
    .isString()
    .withMessage("Address must be a string"),
  body("phone")
    .optional()
    .isString()
    .withMessage("Phone must be a string"),
];
