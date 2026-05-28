import prisma from "@/lib/database.js";
import logger from "@/lib/logger.js";
import { hashPassword } from "@/lib/hash.js";
import { Request, Response } from "express";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany();
    return res.json({
      success: true,
      message: "Successfully fetched all users!",
      data: users,
    });
  } catch (error) {
    logger.error({ error: (error as any).message }, "Failed to retrieve users");
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving users",
      error: (error as any).message,
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const user = await prisma.users.findUnique({
      where: { id },
      include: { profiles: true },
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: `User with ID: ${id} not found` });
    }

    return res.json({
      success: true,
      message: `Successfully fetched user with id ${id}!`,
      data: user,
    });
  } catch (error) {
    logger.error(
      { userId: req.params.id, error: (error as any).message },
      "Failed to retrieve user",
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving user",
      error: (error as any).message,
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const hashed = await hashPassword(password);

    const user = await prisma.users.create({
      data: { name, email, password: hashed, role },
    });

    return res.json({
      success: true,
      message: "Successfully created user!",
      data: user,
    });
  } catch (error) {
    logger.error({ error: (error as any).message }, "Failed to create user");
    res.status(500).json({
      success: false,
      message: "An error occurred while creating user",
      error: (error as any).message,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { name, email, password, role } = req.body;

    const existing = await prisma.users.findUnique({ where: { id } });
    if (!existing) {
      return res
        .status(404)
        .json({ status: false, message: `User with ID: ${id} not found` });
    }

    const hashed = await hashPassword(password);

    await prisma.users.update({
      where: { id },
      data: { name, email, password: hashed, role },
    });

    const user = await prisma.users.findUnique({ where: { id } });

    return res.json({
      success: true,
      message: `Successfully updated user with the id of ${id}!`,
      data: user,
    });
  } catch (error) {
    logger.error(
      { userId: req.params.id, error: (error as any).message },
      "Failed to update user",
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while updating user",
      error: (error as any).message,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    const existing = await prisma.users.findUnique({ where: { id } });
    if (!existing) {
      return res
        .status(404)
        .json({ status: false, message: `User with ID: ${id} not found` });
    }

    await prisma.users.delete({ where: { id } });

    return res.json({
      success: true,
      message: "Successfully deleted a User!",
      data: null,
    });
  } catch (error) {
    logger.error(
      { userId: req.params.id, error: (error as any).message },
      "Failed to delete user",
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting user",
      error: (error as any).message,
    });
  }
};

export const isUserExist = async (id: number) => {
  const user = await prisma.users.findUnique({
    where: { id },
  });
  return !!user;
};
