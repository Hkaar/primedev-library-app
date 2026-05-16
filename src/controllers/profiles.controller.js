import prisma from "../../lib/database.js";
import logger from "../../lib/logger.js";

export const getProfiles = async (req, res) => {
  try {
    const profiles = await prisma.profiles.findMany();
    return res.json({
      success: true,
      message: "Successfully fetched all profiles!",
      data: profiles,
    });
  } catch (error) {
    logger.error({ error: error.message }, "Failed to retrieve profiles");
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving profiles",
      error: error.message,
    });
  }
};

export const getProfileById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
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
      { userId: req.params.id, error: error.message },
      "Failed to retrieve profile",
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving profile",
      error: error.message,
    });
  }
};

export const createProfile = async (req, res) => {
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
    logger.error({ error: error.message }, "Failed to create profile");
    res.status(500).json({
      success: false,
      message: "An error occurred while creating profile",
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
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
      where: { id },
      data: { address, phone },
    });

    const profile = await prisma.profiles.findUnique({ where: { id } });

    return res.json({
      success: true,
      message: `Successfully updated profile with the id of ${id}!`,
      data: profile,
    });
  } catch (error) {
    logger.error(
      { userId: req.params.id, error: error.message },
      "Failed to update profile",
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while updating profile",
      error: error.message,
    });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.profiles.findUnique({
      where: { userId: id },
    });
    if (!existing) {
      return res.status(404).json({
        status: false,
        message: `Profile with user ID: ${id} not found`,
      });
    }

    await prisma.profiles.delete({ where: { id } });

    return res.json({
      success: true,
      message: "Successfully deleted a Profile!",
      data: null,
    });
  } catch (error) {
    logger.error(
      { userId: req.params.id, error: error.message },
      "Failed to delete profile",
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting profile",
      error: error.message,
    });
  }
};
