import prisma from "../../lib/database.js";
import logger from "../../lib/logger.js";
import { Request, Response } from "express";
import { getFileUrl } from "./cloudinary.controller.js";

let cache: { data: any; ts: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getCategories = async (req: Request, res: Response) => {
  try {
    if (cache && Date.now() - cache.ts < CACHE_TTL) {
      return res.json({ success: true, message: "Fetched from cache", data: cache.data });
    }

    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "20");
    const skip = (page - 1) * limit;

    const categories = await prisma.categories.findMany({
      include: {
        books: {
          select: {
            id: true,
            coverUrl: true,
          },
        },
      },
      skip,
      take: limit,
    });

    const categoriesWithCount = categories.map((cat) => {
      const bookCount = cat.books.length;
      const thumbnail =
        cat.books.length > 0 && cat.books[0].coverUrl
          ? getFileUrl(cat.books[0].coverUrl)
          : null;
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/ /g, "-"),
        bookCount,
        thumbnail,
      };
    });

    categoriesWithCount.sort((a, b) => b.bookCount - a.bookCount);

    cache = { data: categoriesWithCount, ts: Date.now() };

    return res.json({
      success: true,
      message: "Successfully fetched categories!",
      data: categoriesWithCount,
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
    const { name, parentCategoryId } = req.body;
    let depth = 0;

    if (parentCategoryId) {
      const parent = await prisma.categories.findUnique({
        where: { id: parseInt(parentCategoryId) },
      });
      if (!parent) {
        return res.status(404).json({ success: false, message: "Parent category not found" });
      }
      depth = parent.depth + 1;
    }

    const category = await prisma.categories.create({
      data: {
        name,
        parentCategoryId: parentCategoryId ? parseInt(parentCategoryId) : null,
        depth,
      },
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
    const { name, parentCategoryId } = req.body;

    const existing = await prisma.categories.findUnique({ where: { id } });

    if (!existing) {
      return res
        .status(404)
        .json({ status: false, message: `Category with ID: ${id} not found` });
    }

    let depth = existing.depth;
    if (parentCategoryId && parseInt(parentCategoryId) !== existing.parentCategoryId) {
      // Circular reference check
      if (parseInt(parentCategoryId) === id) {
        return res.status(400).json({ success: false, message: "Cannot set category as its own parent" });
      }

      const parent = await prisma.categories.findUnique({
        where: { id: parseInt(parentCategoryId) },
      });
      if (!parent) {
        return res.status(404).json({ success: false, message: "Parent category not found" });
      }
      depth = parent.depth + 1;
    }

    await prisma.categories.update({
      where: { id },
      data: {
        name,
        parentCategoryId: parentCategoryId ? parseInt(parentCategoryId) : undefined,
        depth,
      },
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

export const getSubCategories = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    const category = await prisma.categories.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const subcategories = await prisma.categories.findMany({
      where: { parentCategoryId: id },
      include: { _count: { select: { books: true } } },
    });

    return res.json({
      success: true,
      data: subcategories,
    });
  } catch (error) {
    logger.error({ error: (error as any).message }, "Failed to fetch subcategories");
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching subcategories",
      error: (error as any).message,
    });
  }
};

export const getCategoryTree = async (req: Request, res: Response) => {
  try {
    const allCategories = await prisma.categories.findMany({
      include: {
        _count: { select: { books: true } },
      },
    });

    const buildTree = (parentId: number | null): any[] => {
      return allCategories
        .filter((cat) => cat.parentCategoryId === parentId)
        .map((cat) => ({
          ...cat,
          children: buildTree(cat.id),
        }));
    };

    const tree = buildTree(null);

    return res.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    logger.error({ error: (error as any).message }, "Failed to fetch category tree");
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching category tree",
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
