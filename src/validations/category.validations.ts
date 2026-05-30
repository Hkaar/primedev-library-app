import { body } from "express-validator";

export const createCategoryValidation = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .notEmpty()
    .withMessage("Name is required"),
  body("parentCategoryId")
    .optional()
    .isInt()
    .withMessage("Parent Category ID must be an integer"),
];

export const updateCategoryValidation = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string"),
  body("parentCategoryId")
    .optional()
    .isInt()
    .withMessage("Parent Category ID must be an integer"),
];
