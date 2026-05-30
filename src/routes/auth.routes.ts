import { Router } from "express";

import {
  loginValidation,
  registerValidation,
} from "../validations/auth.validations.js";
import { login, register } from "../controllers/auth.controller.js";

const router = Router();

/**
 * @param {Request} req
 * @param {Response} res
 */
router.post("/login", loginValidation, login);

/**
 * @param {Request} req
 * @param {Response} res
 */
router.post("/register", registerValidation, register);

export default router;
