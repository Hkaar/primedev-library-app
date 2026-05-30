import { Router } from "express";
import * as reviewController from "../controllers/reviews.controller.js";
import { reviewValidation } from "../validations/review.validations.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authenticateToken, reviewValidation, reviewController.createReview);
router.get("/:id/reviews", reviewController.getBookReviews);

export default router;
