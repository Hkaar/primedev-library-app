import express from "express";
import { pinoHttp } from "pino-http";
import router from "./routes/index.routes.js";
import logger from "@/lib/logger.js";
import { initReminderCron } from "./services/reminder.service.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp());

app.use(router);

initReminderCron();

if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info(`Library API is running at http://localhost:${port}`);
    logger.info("Application started successfully");
  });
}

export default app;
