import prisma from "../../lib/database.js";
import logger from "../../lib/logger.js";
import { Request, Response } from "express";
import { uploadFile, deleteFile } from "./cloudinary.controller.js";

export const getProfiles = async (req: Request, res: Response) => {
  try {
    const profiles = await prisma.profiles.findMany();
    return res.json({
      success: true,
      message: "Successfully fetched all profiles!",
      data: profiles,
    });
  } catch (error) {
    logger.error({ error: (error as any).message }, "Failed to retrieve profiles");
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving profiles",
      error: (error as any).message,
    });
  }
};

export const getProfileById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const profile = await prisma.profiles.findUnique({ where: { userId: id } });

    if (!profile) {
      return res.status(404).json({
        status: false,
        message: `Profile with user ID: ${id} not found`,
      });
    }

    return res.json({
      success: true,
      message: `Successfully fetched profile with id ${id}!`,
      data: profile,
    });
  } catch (error) {
    logger.error(
      { userId: req.params.id, error: (error as any).message },
      "Failed to retrieve profile",
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving profile",
      error: (error as any).message,
    });
  }
};

export const createProfile = async (req: Request, res: Response) => {
  try {
    const { userId, address, phone } = req.body;

    const user = await prisma.users.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: `User with ID: ${userId} not found` });
    }

    const profile = await prisma.profiles.create({
      data: { userId: parseInt(userId), address, phone },
    });

    return res.json({
      success: true,
      message: "Successfully created profile!",
      data: profile,
    });
  } catch (error) {
    logger.error({ error: (error as any).message }, "Failed to create profile");
    res.status(500).json({
      success: false,
      message: "An error occurred while creating profile",
      error: (error as any).message,
    });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { address, phone } = req.body;

    const existing = await prisma.profiles.findUnique({
      where: { userId: id },
    });

    if (!existing) {
      return res.status(404).json({
        status: false,
        message: `Profile with user ID: ${id} not found`,
      });
    }

    await prisma.profiles.update({
      where: { id: existing.id },
      data: { address, phone },
    });

    const profile = await prisma.profiles.findUnique({ where: { id: existing.id } });

    return res.json({
      success: true,
      message: `Successfully updated profile with the id of ${id}!`,
      data: profile,
    });
  } catch (error) {
    logger.error(
      { userId: req.params.id, error: (error as any).message },
      "Failed to update profile",
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while updating profile",
      error: (error as any).message,
    });
  }
};

export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    const existing = await prisma.profiles.findUnique({
      where: { userId: id },
    });
    if (!existing) {
      return res.status(404).json({
        status: false,
        message: `Profile with user ID: ${id} not found`,
      });
    }

    await prisma.profiles.delete({ where: { id: existing.id } });

    return res.json({
      success: true,
      message: "Successfully deleted a Profile!",
      data: null,
    });
  } catch (error) {
    logger.error(
      { userId: req.params.id, error: (error as any).message },
      "Failed to delete profile",
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting profile",
      error: (error as any).message,
    });
  }
};

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const avatar = (req as any).file;

    if (!avatar) {
      return res.status(400).json({ success: false, message: "Avatar file is required" });
    }

    if (!avatar.mimetype.startsWith("image/")) {
      return res.status(400).json({ success: false, message: "Invalid file type" });
    }

    if (avatar.size > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: "File too large (max 5MB)" });
    }

    const profile = await prisma.profiles.findUnique({ where: { userId } });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    if (profile.avatarPublicId) {
      await deleteFile(profile.avatarPublicId);
    }

    const result = await uploadFile(avatar, { folder: "library-api/profiles/avatars" });

    const updatedProfile = await prisma.profiles.update({
      where: { userId },
      data: {
        avatarUrl: result.secure_url,
        avatarPublicId: result.public_id,
      },
    });

    return res.json({
      success: true,
      message: "Avatar uploaded successfully",
      data: updatedProfile,
    });
  } catch (error) {
    logger.error({ error: (error as any).message }, "Failed to upload avatar");
    res.status(500).json({
      success: false,
      message: "An error occurred while uploading avatar",
      error: (error as any).message,
    });
  }
};
