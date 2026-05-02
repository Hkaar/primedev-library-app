import { Router } from "express";

import {
  getProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
} from "../controllers/profiles.controller.js";
import { authorizeAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.get("/", getProfiles);

router.get("/:id", getProfileById);

router.post("/", createProfile);

router.put("/:id", updateProfile);

router.delete("/:id", authorizeAdmin, deleteProfile);

export default router;
