import prisma from "../../lib/database.js";
import { validationResult } from "express-validator";

import { isCategoryExist } from "./categories.controller.js";
import { checkValidation } from "../../helpers/validator.js";

import { getFileUrl, uploadFile, deleteFile } from "./cloudinary.controller.js";

/**
 * Get all the books from the database
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
export const getBooks = async (req, res) => {
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
};

/**
 * Get a specific book from the database
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
export const getBookById = async (req, res) => {
  const id = parseInt(req.params.id);
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
 * @param {express.Request} req
 * @param {express.Response} res
 */
export const createBook = async (req, res) => {
  if (!checkValidation(req, res)) return res;

  const { title, author, year, categoryId } = req.body;

  const category = await isCategoryExist(parseInt(categoryId)); // fix

  if (!category) {
    return res.status(404).json({
      status: false,
      message: `Category with ID: ${categoryId} not found`,
    });
  }

  const cover = req.file;
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
};

/**
 * Update a stored book in the database
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
export const updateBook = async (req, res, next) => {
  if (!checkValidation(req, res)) return res;

  const id = parseInt(req.params.id);
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

  const cover = req.file;
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
};

/**
 * Delete a stored book from the database
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
export const deleteBook = async (req, res) => {
  const id = parseInt(req.params.id);

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
};

export const isBookExist = async (id) => {
  const book = await prisma.books.findUnique({
    where: {
      id: id,
    },
  });

  return !!book;
};
