import express from "express";
import pinoHttp from "pino-http";

import router from "./routes/index.routes.js";
import logger from "../lib/logger.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use(pinoHttp);
app.use(router);

app.listen(port, () => {
  logger.info(`The server is running at http://localhost:${port}`);
});
