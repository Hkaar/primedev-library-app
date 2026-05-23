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

if (process.env.ENV !== "production" || process.env.ENV !== "PRODUCTION") {
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    logger.info(`Library API is running at http://localhost:${port}`);
    logger.info("Application started successfully");
  });
}

export default app;
