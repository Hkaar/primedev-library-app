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

  const user = db.find((user) => user.id === id);

  if (!user) {
    res.send(`User with ID: ${id} not found`);
  }

  res.send(user);
});

/**
 * @param {Request} req
 * @param {Response} res
 */
router.post("/", (req, res) => {
  const { username, email, password } = req.body;

  const id = db.length + 1;

  db.push({
    id: id,
    username: username,
    email: email,
    password: password,
  });

  res.json({
    msg: "Successfully created user!",
    id: id,
  });
});

/**
 * @param {Request} req
 * @param {Response} res
 */
router.put("/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const { username, email, password } = req.body;

  const userIndex = db.findIndex((user) => user.id === id);

  if (userIndex === -1) {
    res.send(`User with ID: ${id} not found`);
    return;
  }

  db[userIndex] = {
    id: db[userIndex].id,
    username,
    email,
    password,
  };

  res.send(`User with ID: ${id} updated successfully`);
});

/**
 * @param {Request} req
 * @param {Response} res
 */
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const userIndex = db.findIndex((user) => user.id === id);

  if (userIndex === -1) {
    res.send(`User with ID: ${id} not found`);
    return;
  }

  db.splice(userIndex, 1);

  res.send(`User with ID: ${id} deleted successfully`);
});

export default router;
