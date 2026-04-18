import prisma from "../../lib/database.js";

import { isUserExist } from "./users.controller.js";
import { isBookExist } from "./books.controller.js";

/**
 * Get all books thats been borrowed
 *
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export const getAllBorrowings = async (req, res) => {
  const borrowings = await prisma.borrowings.findMany({
    include: {
      borrower: { select: { id: true, name: true, email: true } },
      book: true,
    },
  });

  res.json({
    success: true,
    message: "Borrowed books was retrieved successfully!",
    data: borrowings,
  });
};

export const getBorrowingById = async (req, res) => {
  const id = parseInt(req.params.id);

  const borrowing = await prisma.borrowings.findUnique({
    where: { id: parseInt(id) },
    include: {
      borrower: { select: { id: true, name: true, email: true } },
      book: true,
    },
  });

  if (!borrowing) {
    return res.json({
      success: false,
      message: `Borrowing with ID: ${id} not found`,
    });
  }

  res.json({
    success: true,
    message: "Borrowing retrieved successfully",
    data: borrowing,
  });
};

/**
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export const createBorrowing = async (req, res) => {
  const { userId, bookId } = req.body;

  const userExists = await isUserExist(userId);

  if (!userExists) {
    return res.json({
      success: false,
      message: `User with ID: ${userId} not found`,
    });
  }

  const bookExists = await isBookExist(bookId);

  if (!bookExists) {
    return res.json({
      success: false,
      message: `Book with ID: ${bookId} not found`,
    });
  }

  const borrowing = await prisma.borrowings.create({
    data: {
      userId: parseInt(userId),
      bookId: parseInt(bookId),
    },
    include: {
      borrower: { select: { id: true, name: true, email: true } },
      book: true,
    },
  });

  await prisma.books.update({
    where: { id: parseInt(bookId) },
    data: { available: false },
  });

  res.json({
    success: true,
    message: "Borrowing created successfully",
    data: borrowing,
  });
};

/**
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export const returnBook = async (req, res) => {
  const { id } = req.params;

  const borrowing = await prisma.borrowings.findUnique({
    where: { id: parseInt(id) },
  });

  if (!borrowing) {
    return res.json({
      success: false,
      message: "Borrowing not found",
    });
  }

  if (borrowing.returned_at) {
    return res.json({
      success: false,
      message: "Book already returned",
    });
  }

  const returnedBorrowing = await prisma.borrowings.update({
    where: { id: parseInt(id) },
    data: { returned_at: new Date() },
    include: {
      borrower: { select: { id: true, name: true, email: true } },
      book: true,
    },
  });

  await prisma.books.update({
    where: { id: returnedBorrowing.bookId },
    data: { available: true },
  });

  res.json({
    success: true,
    message: "Book returned successfully",
    data: returnedBorrowing,
  });
};

/**
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
export const deleteBorrowing = async (req, res) => {
  const id = parseInt(req.params.id);

  const borrowing = await prisma.borrowings.findUnique({
    where: { id: parseInt(id) },
    include: {
      borrower: { select: { id: true, name: true, email: true } },
      book: true,
    },
  });

  if (!borrowing) {
    return res.json({
      success: false,
      message: "Borrowing not found",
    });
  }

  await prisma.borrowings.delete({ where: { id: parseInt(id) } });

  if (!borrowing.returned_at) {
    await prisma.books.update({
      where: { id: borrowing.bookId },
      data: { available: true },
    });
  }

  res.json({
    success: true,
    message: "Borrowing deleted successfully",
    data: borrowing,
  });
};
