import prisma from "@/lib/database.js";
import logger from "@/lib/logger.js";
import { Request, Response } from "express";

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.categories.findMany();
    return res.json({
      success: true,
      message: "Successfully fetched all categories!",
      data: categories,
    });
  } catch (error) {
    logger.error({ error: (error as any).message }, "Failed to retrieve categories");
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving categories",
      error: (error as any).message,
    });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const category = await prisma.categories.findUnique({ where: { id } });

    if (!category) {
      return res
        .status(404)
        .json({ status: false, message: `Category with ID: ${id} not found` });
    }

    return res.json({
      success: true,
      message: `Successfully fetched category with id ${id}!`,
      data: category,
    });
  } catch (error) {
    logger.error(
      { categoryId: req.params.id, error: (error as any).message },
      "Failed to retrieve category",
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving category",
      error: (error as any).message,
    });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const category = await prisma.categories.create({
      data: { name },
    });

    return res.json({
      success: true,
      message: "Successfully created category!",
      data: category,
    });
  } catch (error) {
    logger.error({ error: (error as any).message }, "Failed to create category");
    res.status(500).json({
      success: false,
      message: "An error occurred while creating category",
      error: (error as any).message,
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const { name } = req.body;

    const existing = await prisma.categories.findUnique({ where: { id } });

    if (!existing) {
      return res
        .status(404)
        .json({ status: false, message: `Category with ID: ${id} not found` });
    }

    await prisma.categories.update({
      where: { id },
      data: { name },
    });

    const category = await prisma.categories.findUnique({ where: { id } });

    return res.json({
      success: true,
      message: `Successfully updated category with the id of ${id}!`,
      data: category,
    });
  } catch (error) {
    logger.error(
      { categoryId: req.params.id, error: (error as any).message },
      "Failed to update category",
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while updating category",
      error: (error as any).message,
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    const existing = await prisma.categories.findUnique({ where: { id } });
    if (!existing) {
      return res
        .status(404)
        .json({ status: false, message: `Category with ID: ${id} not found` });
    }

    await prisma.categories.delete({ where: { id } });

    return res.json({
      success: true,
      message: "Successfully deleted a Category!",
      data: null,
    });
  } catch (error) {
    logger.error(
      { categoryId: req.params.id, error: (error as any).message },
      "Failed to delete category",
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting category",
      error: (error as any).message,
    });
  }
};

export const isCategoryExist = async (id: number) => {
  const category = await prisma.categories.findUnique({
    where: { id },
  });
  return !!category;
};
