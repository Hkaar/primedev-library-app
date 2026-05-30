import prisma from "../../lib/database.js";
import logger from "../../lib/logger.js";
import { hashPassword } from "../../lib/hash.js";
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

export const getBorrowingHistory = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string);
    const page = parseInt((req.query.page as string) || "1");
    const limit = parseInt((req.query.limit as string) || "10");
    const skip = (page - 1) * limit;

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const [history, total] = await Promise.all([
      prisma.borrowings.findMany({
        where: { userId },
        include: { book: true },
        orderBy: { borrow_date: "desc" },
        skip,
        take: limit,
      }),
      prisma.borrowings.count({ where: { userId } }),
    ]);

    const enrichedHistory = history.map((b) => {
      let status = "active";
      let overdueDays = 0;
      if (b.returned_at) {
        status = "returned";
      } else if (new Date() > b.dueDate) {
        status = "overdue";
        const diffTime = Math.abs(new Date().getTime() - b.dueDate.getTime());
        overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        ...b,
        status,
        overdueDays,
        fine: overdueDays * 5000,
      };
    });

    return res.json({
      success: true,
      data: enrichedHistory,
      total,
      page,
      limit,
    });
  } catch (error) {
    logger.error({ userId: req.params.id, error: (error as any).message }, "Failed to fetch history");
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching history",
      error: (error as any).message,
    });
  }
};

export const getBorrowingStats = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string);
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const borrowings = await prisma.borrowings.findMany({
      where: { userId },
    });

    const totalBorrowed = borrowings.length;
    const returned = borrowings.filter((b) => b.returned_at).length;
    const active = borrowings.filter((b) => !b.returned_at && new Date() <= b.dueDate).length;
    const overdue = borrowings.filter((b) => !b.returned_at && new Date() > b.dueDate).length;

    let totalFine = 0;
    borrowings.forEach((b) => {
      if (!b.returned_at && new Date() > b.dueDate) {
        const diffTime = Math.abs(new Date().getTime() - b.dueDate.getTime());
        const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalFine += overdueDays * 5000;
      }
    });

    return res.json({
      success: true,
      data: {
        totalBorrowed,
        returned,
        active,
        overdue,
        totalFine,
      },
    });
  } catch (error) {
    logger.error({ userId: req.params.id, error: (error as any).message }, "Failed to fetch stats");
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching stats",
      error: (error as any).message,
    });
  }
};

export const getActivityDashboard = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string);
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        borrowings: {
          include: { book: { include: { categories: true } } },
          orderBy: { borrow_date: "desc" },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const borrowings = user.borrowings;

    // Borrowing Stats
    const totalBorrowed = borrowings.length;
    const returned = borrowings.filter((b) => b.returned_at).length;
    const active = borrowings.filter((b) => !b.returned_at).length;

    // Favorite Categories
    const categoryCounts: any = {};
    borrowings.forEach((b) => {
      const catName = b.book.categories?.name || "Uncategorized";
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    });
    const favoriteCategories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 3);

    // Reading Patterns (Books per month)
    const patterns: any = {};
    borrowings.forEach((b) => {
      const month = b.borrow_date.toISOString().substring(0, 7); // YYYY-MM
      patterns[month] = (patterns[month] || 0) + 1;
    });

    // Last 10 books
    const last10 = borrowings.slice(0, 10).map((b) => ({
      title: b.book.title,
      borrowDate: b.borrow_date,
      returnStatus: b.returned_at ? "returned" : "active",
    }));

    // Recommendations
    const topCatIds = [
      ...new Set(
        borrowings
          .filter((b) => b.book.categoryId)
          .map((b) => b.book.categoryId as number),
      ),
    ].slice(0, 2);

    const borrowedBookIds = borrowings.map((b) => b.bookId);

    const recommendations = await prisma.books.findMany({
      where: {
        categoryId: { in: topCatIds },
        id: { notIn: borrowedBookIds },
      },
      take: 5,
    });

    // Reading Streak (consecutive months)
    const uniqueMonths = [
      ...new Set(borrowings.map((b) => b.borrow_date.toISOString().substring(0, 7))),
    ]
      .sort()
      .reverse();

    let streak = 0;
    if (uniqueMonths.length > 0) {
      streak = 1;
      for (let i = 0; i < uniqueMonths.length - 1; i++) {
        const current = new Date(uniqueMonths[i] + "-01");
        const prev = new Date(uniqueMonths[i + 1] + "-01");
        const diffMonths =
          (current.getFullYear() - prev.getFullYear()) * 12 +
          (current.getMonth() - prev.getMonth());
        if (diffMonths === 1) {
          streak++;
        } else {
          break;
        }
      }
    }

    return res.json({
      success: true,
      data: {
        stats: { totalBorrowed, returned, active },
        favoriteCategories,
        readingPatterns: patterns,
        last10,
        recommendations,
        readingStreak: streak,
      },
    });
  } catch (error) {
    logger.error(
      { userId: req.params.id, error: (error as any).message },
      "Failed to fetch dashboard",
    );
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching dashboard",
      error: (error as any).message,
    });
  }
};


