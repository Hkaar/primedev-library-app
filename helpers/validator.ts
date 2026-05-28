import { Request, Response } from "express";
import { validationResult } from "express-validator";

/**
 * Checks the validation for a request
 *
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
export const checkValidation = (req: Request, res: Response): boolean => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: validationErrors.array(),
    });
    return false;
  }

  return true;
};
