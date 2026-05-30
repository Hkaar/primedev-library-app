import { Router } from "express";

import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getSubCategories,
} from "../controllers/categories.controller.js";
import {
  createCategoryValidation,
  updateCategoryValidation,
} from "../validations/category.validations.js";
import { authorizeAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.get("/", getCategories);
router.get("/tree", getCategoryTree);
router.get("/:id", getCategoryById);
router.get("/:id/subcategories", getSubCategories);

router.post("/", authorizeAdmin, createCategoryValidation, createCategory);

router.put("/:id", authorizeAdmin, updateCategoryValidation, updateCategory);

router.delete("/:id", authorizeAdmin, deleteCategory);

export default router;
