import { Router } from "express";
import multer from "multer";

import {
  getProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
  uploadAvatar,
} from "../controllers/profiles.controller.js";
import {
  createProfileValidation,
  updateProfileValidation,
} from "../validations/profile.validations.js";
import { authorizeAdmin } from "../middlewares/admin.middleware.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get("/", getProfiles);

router.get("/:id", getProfileById);

router.post("/", createProfileValidation, createProfile);

router.post("/avatar", authenticateToken, upload.single("avatar"), uploadAvatar);

router.put("/:id", updateProfileValidation, updateProfile);

router.delete("/:id", authorizeAdmin, deleteProfile);

export default router;
