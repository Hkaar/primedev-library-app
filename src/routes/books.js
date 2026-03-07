import { Router } from "express";

const router = Router();

/**
 * @param {Request} req
 * @param {Response} res
 */
router.get("/", (req, res) => {
  res.json({
    msg: "Hello world!",
  });
});

/**
 * @param {Request} req
 * @param {Response} res
 */
router.get("/:id", (req, res) => {
  res.json({
    msg: "Hello world!",
  });
});

/**
 * @param {Request} req
 * @param {Response} res
 */
router.post("/", (req, res) => {});

/**
 * @param {Request} req
 * @param {Response} res
 */
router.put("/:id", (req, res) => {});

/**
 * @param {Request} req
 * @param {Response} res
 */
router.delete("/:id", (req, res) => {});

export default router;
