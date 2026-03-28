import express from "express";

import router from "./routes/index.routes.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use(router);

app.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}`);
});
