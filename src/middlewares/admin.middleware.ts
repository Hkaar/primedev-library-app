import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Memeriksa apakah user adalah admin
  // dengan memeriksa properti role pada objek user yang sudah di-decode dari token JWT
  console.log((req as any).user);
  if (!(req as any).user || (req as any).user.role !== "ADMIN") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }

  next();
};
