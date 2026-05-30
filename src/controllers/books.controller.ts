import prisma from "../../lib/database.js";
import logger from "../../lib/logger.js";
import { Request, Response, NextFunction } from "express";

import { isCategoryExist } from "./categories.controller.js";
import { checkValidation } from "../../helpers/validator.js";

import { getFileUrl, uploadFile, deleteFile } from "./cloudinary.controller.js";

/**
 * Get all the books from the database
 *
 * @param {Request} req
 * @param {Response} res
 */
export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await prisma.books.findMany();

    books.forEach((book) => {
      if (!book.coverUrl) {
        book.coverUrl = null;
      } else {
        book.coverUrl = getFileUrl(book.coverUrl);
      }
    });

    return res.json({
      success: true,
      message: "Successfully fetched all books!",
      data: books,
    });
  } catch (error) {
    logger.error({ error: (error as any).message }, "Failed to retrieve books");

    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving books",
      error: (error as any).message,
    });
  }
};

/**
 * Get a specific book from the database
 *
 * @param {Request} req
 * @param {Response} res
 */
export const getBookById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const book = await prisma.books.findUnique({
    where: { id },
    include: { categories: true },
  });

  if (!book) {
    return res
      .status(404)
      .json({ status: false, message: `Book with ID: ${id} not found` });
  }

  if (book.coverUrl) {
    book.coverUrl = getFileUrl(book.coverUrl);
  } else {
    book.coverUrl = null;
  }

  return res.json({
    success: true,
    message: `Successfully fetched book with id ${id}!`,
    data: book,
  });
};

/**
 * Create a book into the database
 *
 * @param {Request} req
 * @param {Response} res
 */
export const createBook = async (req: Request, res: Response) => {
  try {
    if (!checkValidation(req, res)) return res;

    const { title, author, year, categoryId } = req.body;

    const category = await isCategoryExist(parseInt(categoryId)); // fix

    if (!category) {
      return res.status(404).json({
        status: false,
        message: `Category with ID: ${categoryId} not found`,
      });
    }

    const cover = (req as any).file;
    let cloudinaryId = null;

    if (cover) {
      const result = await uploadFile(cover);
      cloudinaryId = result.public_id;
    }

    const book = await prisma.books.create({
      data: {
        title,
        author,
        year: parseInt(year),
        categoryId: parseInt(categoryId),
        coverUrl: cloudinaryId,
      },
    });

    return res.json({
      success: true,
      message: "Successfully created book!",
      data: book,
    });
  } catch (error) {
    logger.error({ error: (error as any).message }, "Failed to create book");
    res.status(500).json({
      success: false,
      message: "An error occurred while creating book",
      error: (error as any).message,
    });
  }
};

/**
 * Update a stored book in the database
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!checkValidation(req, res)) return res;

    const id = parseInt(req.params.id as string);
    const { title, author, year, categoryId } = req.body;

    const existing = await prisma.books.findUnique({ where: { id } });
    if (!existing) {
      return res
        .status(404)
        .json({ status: false, message: `Book with ID: ${id} not found` });
    }

    if (categoryId) {
      const category = await isCategoryExist(parseInt(categoryId));

      if (!category) {
        return res
          .status(404)
          .json({ msg: `Category with ID: ${categoryId} not found` });
      }
    }

    const cover = (req as any).file;
    let cloudinaryId = existing.coverUrl;

    // Jika ada file cover yang diunggah, unggah ke Cloudinary dan dapatkan public_id-nya
    if (cover) {
      // Jika buku sudah memiliki cover sebelumnya,
      // hapus file cover lama dari Cloudinary menggunakan public_id yang disimpan di database
      if (existing.coverUrl) {
        const deleted = await deleteFile(existing.coverUrl);
      }

      const result = await uploadFile(cover);
      cloudinaryId = result.public_id;
    }

    await prisma.books.update({
      where: { id },
      data: {
        title,
        author,
        year: parseInt(year),
        categoryId: parseInt(categoryId),
        coverUrl: cloudinaryId,
      },
    });

    const book = await prisma.books.findUnique({ where: { id } });

    return res.json({
      success: true,
      message: `Successfully updated book with the id of ${id}!`,
      data: book,
    });
  } catch (error) {
    logger.error(
      { bookId: req.params.id, error: (error as any).message },
      "Failed to update book",
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while updating book",
      error: (error as any).message,
    });
  }
};

/**
 * Delete a stored book from the database
 *
 * @param {Request} req
 * @param {Response} res
 */
export const deleteBook = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    const existing = await prisma.books.findUnique({ where: { id } });
    if (!existing) {
      return res
        .status(404)
        .json({ status: false, message: `Book with ID: ${id} not found` });
    }

    if (existing.coverUrl) {
      const deleted = await deleteFile(existing.coverUrl);
    }

    await prisma.books.delete({ where: { id } });

    return res.json({
      success: true,
      message: "Successfully deleted a book!",
      data: null,
    });
  } catch (error) {
    logger.error(
      { bookId: req.params.id, error: (error as any).message },
      "Failed to delete book",
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting book",
      error: (error as any).message,
    });
  }
};

export const searchBooks = async (req: Request, res: Response) => {
  try {
    const query = (req.query.query as string)?.trim();
    if (!query) {
      return res.status(400).json({ success: false, message: "Query is required" });
    }

    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "20");
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { author: { contains: query, mode: "insensitive" } },
        { isbn: { contains: query, mode: "insensitive" } },
      ],
    };

    const [results, total] = await Promise.all([
      prisma.books.findMany({
        where: where as any,
        skip,
        take: limit,
      }),
      prisma.books.count({ where: where as any }),
    ]);

    results.forEach((book) => {
      if (book.coverUrl) {
        book.coverUrl = getFileUrl(book.coverUrl);
      } else {
        book.coverUrl = null;
      }
    });

    return res.json({
      results,
      total,
      page,
      limit,
    });
  } catch (error) {
    logger.error({ error: (error as any).message }, "Failed to search books");
    res.status(500).json({
      success: false,
      message: "An error occurred while searching books",
      error: (error as any).message,
    });
  }
};

export const getBookStatus = async (req: Request, res: Response) => {
  try {
    const bookId = parseInt(req.params.id as string);
    const book = await prisma.books.findUnique({
      where: { id: bookId },
      include: {
        borrowings: {
          where: {
            returned_at: null,
            dueDate: { gte: new Date() },
          },
        },
      },
    });

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    const totalCopies = book.totalCopies;
    const borrowedCopies = book.borrowings.length;
    const availableCopies = totalCopies - borrowedCopies;

    let status = "available";
    if (availableCopies <= 0) {
      status = "all-borrowed";
    } else if (availableCopies / totalCopies <= 0.2) {
      status = "low-stock";
    }

    let nextAvailableDate = null;
    if (status === "all-borrowed") {
      const activeBorrowings = await prisma.borrowings.findMany({
        where: { bookId, returned_at: null },
        orderBy: { dueDate: "asc" },
        take: 1,
      });
      if (activeBorrowings.length > 0) {
        nextAvailableDate = activeBorrowings[0].dueDate;
      }
    }

    return res.json({
      status,
      availableCopies,
      totalCopies,
      nextAvailableDate,
    });
  } catch (error) {
    logger.error({ error: (error as any).message }, "Failed to get book status");
    res.status(500).json({
      success: false,
      message: "An error occurred while getting book status",
      error: (error as any).message,
    });
  }
};

export const filterBooks = async (req: Request, res: Response) => {
  try {
    const {
      category,
      author,
      minYear,
      maxYear,
      minRating,
      available,
      sortBy = "title",
      order = "asc",
      page = 1,
      limit = 10,
    } = req.query;

    const p = parseInt(page as string);
    const l = parseInt(limit as string);
    const skip = (p - 1) * l;

    const where: any = {};

    if (category) {
      const categories = (category as string).split(",");
      where.categories = {
        name: { in: categories },
      };
    }

    if (author) {
      where.author = { contains: author as string, mode: "insensitive" };
    }

    if (minYear || maxYear) {
      where.year = {};
      if (minYear) where.year.gte = parseInt(minYear as string);
      if (maxYear) where.year.lte = parseInt(maxYear as string);
    }

    if (available !== undefined) {
      where.available = available === "true";
    }

    if (minRating) {
      const booksWithRating = await prisma.review.groupBy({
        by: ["bookId"],
        _avg: { rating: true },
        having: {
          rating: {
            _avg: { gte: parseFloat(minRating as string) },
          },
        },
      });
      const bookIds = booksWithRating.map((b) => b.bookId);
      where.id = { in: bookIds };
    }

    let orderBy: any = {};
    if (sortBy === "title") orderBy = { title: order };
    else if (sortBy === "year") orderBy = { year: order };
    else if (sortBy === "popularity") {
      orderBy = { borrowings: { _count: order } };
    }

    const [books, total] = await Promise.all([
      prisma.books.findMany({
        where,
        include: {
          categories: true,
          reviews: {
            select: { rating: true },
          },
          _count: {
            select: { borrowings: true, reviews: true },
          },
        },
        orderBy: sortBy === "rating" ? undefined : orderBy,
        skip: sortBy === "rating" ? 0 : skip, // We'll handle rating sort in JS
        take: sortBy === "rating" ? undefined : l,
      }),
      prisma.books.count({ where }),
    ]);

    let results = books.map((book) => {
      const avgRating =
        book.reviews.length > 0
          ? book.reviews.reduce((acc, r) => acc + r.rating, 0) / book.reviews.length
          : 0;

      const { reviews, ...bookData } = book;
      return {
        ...bookData,
        averageRating: avgRating,
        coverUrl: book.coverUrl ? getFileUrl(book.coverUrl) : null,
      };
    });

    if (sortBy === "rating") {
      results.sort((a, b) => {
        return order === "asc"
          ? a.averageRating - b.averageRating
          : b.averageRating - a.averageRating;
      });
      results = results.slice(skip, skip + l);
    }

    const [allCategories, allAuthors] = await Promise.all([
      prisma.categories.findMany({ select: { name: true } }),
      prisma.books.findMany({ select: { author: true }, distinct: ["author"] }),
    ]);

    return res.json({
      success: true,
      data: results,
      total,
      page: p,
      limit: l,
      aggregations: {
        categories: allCategories.map((c) => c.name),
        authors: allAuthors.map((a) => a.author),
      },
    });
  } catch (error) {
    logger.error({ error: (error as any).message }, "Failed to filter books");
    res.status(500).json({
      success: false,
      message: "An error occurred while filtering books",
      error: (error as any).message,
    });
  }
};

export const isBookExist = async (id: number) => {
  const book = await prisma.books.findUnique({
    where: {
      id: id,
    },
  });

  return !!book;
};
