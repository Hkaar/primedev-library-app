import { Router } from "express";

import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/users.controller.js";
import { authorizeAdmin } from "@/src/middlewares/admin.middleware.js";

const router = Router();

router.get("/", getUsers);

router.get("/:id", getUserById);

router.post("/", authorizeAdmin, createUser);

router.put("/:id", authorizeAdmin, updateUser);

router.delete("/:id", authorizeAdmin, deleteUser);

export default router;
