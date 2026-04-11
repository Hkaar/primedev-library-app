import prisma from "../../lib/database.js";

export const getProfiles = async (req, res) => {
  const profiles = await prisma.profiles.findMany();
  return res.json({
    success: true,
    message: "Successfully fetched all profiles!",
    data: profiles,
  });
};

export const getProfileById = async (req, res) => {
  const id = parseInt(req.params.id);
  const profile = await prisma.profiles.findUnique({ where: { id } });

  if (!profile) {
    return res.status(404).json({ msg: `Profile with ID: ${id} not found` });
  }

  return res.json({
    success: true,
    message: `Successfully fetched profile with id ${id}!`,
    data: profile,
  });
};

export const createProfile = async (req, res) => {
  const { userId, address, phone } = req.body;

  const user = await prisma.users.findUnique({ where: { id: userId } });

  if (!user) {
    return res.status(404).json({ msg: `User with ID: ${userId} not found` });
  }

  const profile = await prisma.profiles.create({
    data: { userId, address, phone },
  });

  return res.json({
    success: true,
    message: "Successfully created profile!",
    data: profile,
  });
};

export const updateProfile = async (req, res) => {
  const id = parseInt(req.params.id);
  const { address, phone } = req.body;

  const existing = await prisma.profiles.findUnique({ where: { id } });

  if (!existing) {
    return res.status(404).json({ msg: `Profile with ID: ${id} not found` });
  }

  await prisma.profiles.update({
    where: { id },
    data: { address: address, phone: phone },
  });

  const user = await prisma.profiles.findUnique({ where: { id } });

  return res.json({
    success: true,
    message: `Successfully updated profile with the id of ${id}!`,
    data: user,
  });
};

export const deleteProfile = async (req, res) => {
  const id = parseInt(req.params.id);

  const existing = await prisma.profiles.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ msg: `Profile with ID: ${id} not found` });
  }

  await prisma.profiles.delete({ where: { id } });

  return res.json({
    success: true,
    message: "Successfully deleted a Profile!",
    data: null,
  });
};
