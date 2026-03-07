import express from "express";

import authRouter from "./routes/auth.js";
import bookRouter from "./routes/books.js";
import userRouter from "./routes/users.js";

const app = express();
const port = process.env.PORT || 3000;

app.use("/", authRouter);
app.use("/books", bookRouter);
app.use("/users", userRouter);

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Express Server!" });
});

app.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}`);
});
