import express from "express";

const app = express();
const port = process.env.PORT || 3000;

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
