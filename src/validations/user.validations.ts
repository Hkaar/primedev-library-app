import { body } from "express-validator";

export const createUserValidation = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .notEmpty()
    .withMessage("Name is required"),
  body("email")
    .isEmail()
    .withMessage("Email must be valid")
    .notEmpty()
    .withMessage("Email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .notEmpty()
    .withMessage("Password is required"),
  body("role")
    .optional()
    .isIn(["USER", "ADMIN"])
    .withMessage("Role must be either USER or ADMIN"),
];

export const updateUserValidation = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Email must be valid"),
  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("role")
    .optional()
    .isIn(["USER", "ADMIN"])
    .withMessage("Role must be either USER or ADMIN"),
];
