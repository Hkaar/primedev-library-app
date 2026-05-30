import { Request, Response } from "express";
import prisma from "../../lib/database.js";
import logger from "../../lib/logger.js";
import { checkValidation } from "../../helpers/validator.js";

export const createReview = async (req: Request, res: Response) => {
  try {
    if (!checkValidation(req, res)) return res;

    const { bookId, rating, comment } = req.body;
    const userId = (req as any).user.id;

    const review = await prisma.review.create({
      data: {
        bookId,
        rating,
        comment,
        userId,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Review created",
      review,
    });
  } catch (error) {
    logger.error({ error: (error as any).message }, "Failed to create review");
    res.status(500).json({
      success: false,
      message: "An error occurred during review creation",
      error: (error as any).message,
    });
  }
};

export const getBookReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        bookId: parseInt(id as string),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    logger.error({ error: (error as any).message }, "Failed to get reviews");
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching reviews",
      error: (error as any).message,
    });
  }
};
