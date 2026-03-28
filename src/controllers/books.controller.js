import prisma from "../../lib/database.js";

/**
 * Get all the books from the database
 *
 * @param {express.Request} req
 * @param {express.Response} res
 */
export const getBooks = async (req, res) => {
  const books = await prisma.books.findMany();
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
  const book = await prisma.books.findUnique({ where: { id } });

  if (!book) {
    return res.status(404).json({ msg: `Book with ID: ${id} not found` });
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
  const { title, author, year } = req.body;

  const book = await prisma.books.create({
    data: { title, author, year },
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
export const updateBook = async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, author, year } = req.body;

  const existing = await prisma.books.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ msg: `Book with ID: ${id} not found` });
  }

  await prisma.books.update({
    where: { id },
    data: { title, author, year },
  });

  const book = await prisma.books.findUnique({ where: { id } });

  return res.json({
    success: true,
    message: `Successfully updatedbook with the id of ${id}!`,
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
    return res.status(404).json({ msg: `Book with ID: ${id} not found` });
  }

  await prisma.books.delete({ where: { id } });

  return res.json({
    success: true,
    message: "Successfully deleted a book!",
    data: null,
  });
};
