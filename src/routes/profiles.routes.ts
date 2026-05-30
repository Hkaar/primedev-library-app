import { Router } from "express";
import multer from "multer";

import {
  getProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
  uploadAvatar,
} from "@/src/controllers/profiles.controller.js";
import { authorizeAdmin } from "../middlewares/admin.middleware.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get("/", getProfiles);

router.get("/:id", getProfileById);

router.post("/", createProfile);

router.post("/avatar", authenticateToken, upload.single("avatar"), uploadAvatar);

router.put("/:id", updateProfile);

router.delete("/:id", authorizeAdmin, deleteProfile);

export default router;
