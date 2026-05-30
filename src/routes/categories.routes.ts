import { Router } from "express";

import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getSubCategories,
} from "@/src/controllers/categories.controller.js";
import { authorizeAdmin } from "@/src/middlewares/admin.middleware.js";

const router = Router();

router.get("/", getCategories);
router.get("/tree", getCategoryTree);
router.get("/:id", getCategoryById);
router.get("/:id/subcategories", getSubCategories);

router.post("/", authorizeAdmin, createCategory);

router.put("/:id", authorizeAdmin, updateCategory);

router.delete("/:id", authorizeAdmin, deleteCategory);

export default router;
