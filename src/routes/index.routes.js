import { Router } from "express";

import authRouter from "./auth.routes.js";
import bookRouter from "./books.routes.js";
import userRouter from "./users.routes.js";
import profileRouter from "./profiles.routes.js";
import categoryRouter from "./categories.routes.js";

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

router.use("/books", bookRouter);
router.use("/users", userRouter);
router.use("/profiles", profileRouter);
router.use("/categories", categoryRouter);
router.use("/auth", authRouter);

export default router;
