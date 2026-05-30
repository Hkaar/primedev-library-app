import { Router } from "express";

import {
  loginValidation,
  registerValidation,
} from "@/src/validations/auth.validations.js";
import { login, register } from "@/src/controllers/auth.controller.js";

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
