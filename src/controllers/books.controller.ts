import prisma from "@/lib/database.js";
import logger from "@/lib/logger.js";
import { Request, Response, NextFunction } from "express";

import { validationResult } from "express-validator";

import { isCategoryExist } from "./categories.controller.js";
import { checkValidation } from "@/helpers/validator.js";

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

export const isBookExist = async (id: number) => {
  const book = await prisma.books.findUnique({
    where: {
      id: id,
    },
  });

  return !!book;
};
