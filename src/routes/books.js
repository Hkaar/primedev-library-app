import { Router } from "express";

const router = Router();

const db = [];

/**
 * @param {Request} req
 * @param {Response} res
 */
router.get("/", (req, res) => {
  res.send(db);
});

/**
 * @param {Request} req
 * @param {Response} res
 */
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const book = db.find((book) => book.id === id);

  if (!book) {
    res.send(`Book with ID: ${id} not found`);
  }

  res.send(book);
});

/**
 * @param {Request} req
 * @param {Response} res
 */
router.post("/", (req, res) => {
  const { title, author, year } = req.body;

  const id = db.length + 1;

  db.push({
    id: id,
    title: title,
    author: author,
    year: year,
  });

  res.json({
    msg: "Successfully created book!",
    id: id,
  });
});

/**
 * @param {Request} req
 * @param {Response} res
 */
router.put("/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const { title, author, year } = req.body;

  const bookIndex = db.findIndex((book) => book.id === id);

  if (bookIndex === -1) {
    res.send(`Book with ID: ${id} not found`);
    return;
  }

  db[bookIndex] = {
    id: db[bookIndex].id,
    title,
    author,
    year,
  };

  res.send(`Book with ID: ${id} updated successfully`);
});

/**
 * @param {Request} req
 * @param {Response} res
 */
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const bookIndex = db.findIndex((book) => book.id === id);

  if (bookIndex === -1) {
    res.send(`Book with ID: ${id} not found`);
    return;
  }

  db.splice(bookIndex, 1);

  res.send(`Book with ID: ${id} deleted successfully`);
});

export default router;
