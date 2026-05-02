import { Router } from "express";

import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categories.controller.js";
import { authorizeAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.get("/", getCategories);

router.get("/:id", getCategoryById);

router.post("/", authorizeAdmin, createCategory);

router.put("/:id", authorizeAdmin, updateCategory);

router.delete("/:id", authorizeAdmin, deleteCategory);

export default router;
