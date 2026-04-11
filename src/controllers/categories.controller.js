import prisma from "../../lib/database.js";

export const getCategories = async (req, res) => {
  const categories = await prisma.categories.findMany();
  return res.json({
    success: true,
    message: "Successfully fetched all categories!",
    data: categories,
  });
};

export const getCategoryById = async (req, res) => {
  const id = parseInt(req.params.id);
  const category = await prisma.categories.findUnique({ where: { id } });

  if (!category) {
    return res.status(404).json({ msg: `Category with ID: ${id} not found` });
  }

  return res.json({
    success: true,
    message: `Successfully fetched category with id ${id}!`,
    data: category,
  });
};

export const createCategory = async (req, res) => {
  const { name } = req.body;

  const category = await prisma.categories.create({
    data: { name },
  });

  return res.json({
    success: true,
    message: "Successfully created category!",
    data: category,
  });
};

export const updateCategory = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;

  const existing = await prisma.categories.findUnique({ where: { id } });

  if (!existing) {
    return res.status(404).json({ msg: `Category with ID: ${id} not found` });
  }

  await prisma.categories.update({
    where: { id },
    data: { name },
  });

  const category = await prisma.categories.findUnique({ where: { id } });

  return res.json({
    success: true,
    message: `Successfully updated category with the id of ${id}!`,
    data: category,
  });
};

export const deleteCategory = async (req, res) => {
  const id = parseInt(req.params.id);

  const existing = await prisma.categories.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ msg: `Category with ID: ${id} not found` });
  }

  await prisma.categories.delete({ where: { id } });

  return res.json({
    success: true,
    message: "Successfully deleted a Category!",
    data: null,
  });
};
