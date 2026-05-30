import { Router } from "express";

import authRouter from "./auth.routes.js";
import bookRouter from "./books.routes.js";
import userRouter from "./users.routes.js";
import profileRouter from "./profiles.routes.js";
import categoryRouter from "./categories.routes.js";
import borrowingRouter from "./borrowings.routes.js";
import * as reviewController from "@/src/controllers/reviews.controller.js";
import * as bookController from "@/src/controllers/books.controller.js";
import { reviewValidation } from "@/src/validations/review.validations.js";
import { filterBooksValidation } from "@/src/validations/book.validations.js";
import { authenticateToken } from "@/src/middlewares/auth.middleware.js";

const router = Router();

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
router.get("/", (req, res) => {
  res.json({ message: "Welcome to the Express Server!" });
});

// router.get("/", async (req, res) => {
//   try {
//     await getBooks(req, res);
//   } catch (error) {
//     console.error("Error in getBooks:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

router.post("/reviews", authenticateToken, reviewValidation, reviewController.createReview);
router.get("/books/:id/reviews", reviewController.getBookReviews);
router.get("/books/search", bookController.searchBooks);
router.get("/books/filter", filterBooksValidation, bookController.filterBooks);
router.get("/books/:id/status", bookController.getBookStatus);

router.use("/books", authenticateToken, bookRouter);
router.use("/users", authenticateToken, userRouter);
router.use("/profiles", authenticateToken, profileRouter);
router.use("/categories", authenticateToken, categoryRouter);
router.use("/borrowings", authenticateToken, borrowingRouter);
router.use("/auth", authRouter);

export default router;
