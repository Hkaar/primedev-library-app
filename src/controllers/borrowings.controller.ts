import prisma from "@/lib/database.js";
import logger from "@/lib/logger.js";
import { Request, Response } from "express";

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

    const bookExists = await isBookExist(bookId);

    if (!bookExists) {
      return res.status(404).json({
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
