import bcrypt from "bcrypt";
import "dotenv/config";

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);
};

export const comparePassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword);
};
