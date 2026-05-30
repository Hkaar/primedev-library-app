import prisma from "../../lib/database.js";
import logger from "../../lib/logger.js";
import { Request, Response } from "express";
import { checkValidation } from "../../helpers/validator.js";

import { isUserExist } from "./users.controller.js";
import { isBookExist } from "./books.controller.js";

/**
 * Get all books thats been borrowed
 *
 * @param {Request} req
 * @param {Response} res
 */
export const getAllBorrowings = async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    logger.error({ error: (error as any).message }, "Failed to retrieve borrowings");
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving borrowings",
      error: (error as any).message,
    });
  }
};

export const getBorrowingById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    const borrowing = await prisma.borrowings.findUnique({
      where: { id },
      include: {
        borrower: { select: { id: true, name: true, email: true } },
        book: true,
      },
    });

    if (!borrowing) {
      return res.status(404).json({
        success: false,
        message: `Borrowing with ID: ${id} not found`,
      });
    }

    res.json({
      success: true,
      message: "Borrowing retrieved successfully",
      data: borrowing,
    });
  } catch (error) {
    logger.error(
      { borrowingId: req.params.id, error: (error as any).message },
      "Failed to retrieve borrowing",
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving borrowing",
      error: (error as any).message,
    });
  }
};

/**
 * @param {Request} req
 * @param {Response} res
 */
export const createBorrowing = async (req: Request, res: Response) => {
  try {
    const { userId, bookId } = req.body;

    const userExists = await isUserExist(userId);

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: `User with ID: ${userId} not found`,
      });
    }

    const book = await prisma.books.findUnique({
      where: { id: parseInt(bookId) },
      include: { _count: { select: { borrowings: { where: { returned_at: null } } } } },
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book with ID: ${bookId} not found`,
      });
    }

    if (book._count.borrowings >= book.totalCopies) {
      return res.status(400).json({
        success: false,
        message: "No copies available for this book",
      });
    }

    const borrowing = await prisma.borrowings.create({
      data: {
        userId: parseInt(userId),
        bookId: parseInt(bookId),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 14 days
      },
      include: {
        borrower: { select: { id: true, name: true, email: true } },
        book: true,
      },
    });

    // If this was the last copy, set available to false
    if (book._count.borrowings + 1 >= book.totalCopies) {
      await prisma.books.update({
        where: { id: parseInt(bookId) },
        data: { available: false },
      });
    }

    res.json({
      success: true,
      message: "Borrowing created successfully",
      data: borrowing,
    });
  } catch (error) {
    logger.error({ error: (error as any).message }, "Failed to create borrowing");
    res.status(500).json({
      success: false,
      message: "An error occurred while creating borrowing",
      error: (error as any).message,
    });
  }
};

/**
 * @param {Request} req
 * @param {Response} res
 */
export const returnBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const borrowing = await prisma.borrowings.findUnique({
      where: { id: parseInt(id as string) },
    });

    if (!borrowing) {
      return res.status(404).json({
        success: false,
        message: "Borrowing not found",
      });
    }

    if (borrowing.returned_at) {
      return res.status(404).json({
        success: false,
        message: "Book already returned",
      });
    }

    const returnedBorrowing = await prisma.borrowings.update({
      where: { id: parseInt(id as string) },
      data: { returned_at: new Date() },
      include: {
        borrower: { select: { id: true, name: true, email: true } },
        book: true,
      },
    });

    // Always set available to true when a book is returned
    await prisma.books.update({
      where: { id: returnedBorrowing.bookId },
      data: { available: true },
    });

    res.json({
      success: true,
      message: "Book returned successfully",
      data: returnedBorrowing,
    });
  } catch (error) {
    logger.error(
      { borrowingId: req.params.id, error: (error as any).message },
      "Failed to update borrowing",
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while updating borrowing",
      error: (error as any).message,
    });
  }
};

/**
 * @param {Request} req
 * @param {Response} res
 */
export const deleteBorrowing = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    const borrowing = await prisma.borrowings.findUnique({
      where: { id },
      include: {
        borrower: { select: { id: true, name: true, email: true } },
        book: true,
      },
    });

    if (!borrowing) {
      return res.status(404).json({
        success: false,
        message: "Borrowing not found",
      });
    }

    await prisma.borrowings.delete({ where: { id } });

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
  } catch (error) {
    logger.error(
      { borrowingId: req.params.id, error: (error as any).message },
      "Failed to delete borrowing",
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting borrowing",
      error: (error as any).message,
    });
  }
};

export const getUpcomingDue = async (req: Request, res: Response) => {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const borrowings = await prisma.borrowings.findMany({
      where: {
        returned_at: null,
        dueDate: {
          lte: threeDaysFromNow,
          gte: new Date(),
        },
      },
      include: {
        borrower: { select: { id: true, name: true, email: true } },
        book: { select: { id: true, title: true } },
      },
    });

    return res.json({
      success: true,
      message: "Successfully fetched upcoming due borrowings",
      data: borrowings,
    });
  } catch (error) {
    logger.error({ error: (error as any).message }, "Failed to fetch upcoming due");
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching upcoming due",
      error: (error as any).message,
    });
  }
};

