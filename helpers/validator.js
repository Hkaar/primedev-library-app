import { validationResult } from "express-validator";

/**
 * Checks the validation for a request
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns
 */
export const checkValidation = (req, res) => {
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
