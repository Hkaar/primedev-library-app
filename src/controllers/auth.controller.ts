import bcrypt from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";
import prisma from "@/lib/database.js";
import logger from "@/lib/logger.js";
import { Request, Response } from "express";

import { validationResult } from "express-validator";
import { checkValidation } from "@/helpers/validator.js";
import { comparePassword, hashPassword } from "@/lib/hash.js";

export const register = async (req: Request, res: Response) => {
  try {
    if (!checkValidation(req, res)) return res;

    const { name, email, password } = req.body;

    const count = await prisma.users.count({ where: { email } });

    if (count > 0) {
      return res.status(409).json({
        success: false,
        error: "Email already in use",
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: "Registration successful",
      user,
    });
  } catch (error) {
    logger.error({ error: (error as any).message }, "Failed to register user");
    res.status(500).json({
      success: false,
      message: "An error occurred during registration",
      error: (error as any).message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    if (!checkValidation(req, res)) return res;

    const { email, password } = req.body;

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" },
    );

    // @ts-ignore
    delete user.password;

    res.status(200).json({
      message:
        "Login successful. Copy the token below for authenticated requests. Expires in 1 hour.",
      user,
      token,
    });
  } catch (error) {
    logger.error({ error: (error as any).message }, "Failed to login user");
    res.status(500).json({
      success: false,
      message: "An error occurred during login",
      error: (error as any).message,
    });
  }
};
