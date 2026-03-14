import { Router } from "express";

import prisma from "../../lib/database.js";
import { hashPassword } from "../../lib/hash.js";

const router = Router();

router.get("/", async (req, res) => {
  const users = await prisma.users.findMany();
  return res.json({
    success: true,
    message: "Successfully fetched all users!",
    data: users,
  });
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const user = await prisma.users.findUnique({ where: { id } });

  if (!user) {
    return res.status(404).json({ msg: `User with ID: ${id} not found` });
  }

  return res.json({
    success: true,
    message: `Successfully fetched user with id ${id}!`,
    data: user,
  });
});

router.post("/", async (req, res) => {
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
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email, password, role } = req.body;

  const existing = await prisma.users.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ msg: `User with ID: ${id} not found` });
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
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  const existing = await prisma.users.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ msg: `User with ID: ${id} not found` });
  }

  await prisma.users.delete({ where: { id } });

  return res.json({
    success: true,
    message: "Successfully deleted a book!",
    data: null,
  });
});

export default router;
