import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import { logger } from "./utils/logger";
import { authRoutes } from "./features/authentication/routes";
import { createApiResponse } from "./features/authentication/utils";

const app = express();
const PORT = config.port;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.get("/health", (req, res) => {
  res.json(createApiResponse(true, "Server is running"));
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err);
  res.status(500).json(createApiResponse(false, "Internal server error"));
});

app.listen(PORT, () => {
  logger.info(`MS1 Core API running on port ${PORT}`);
});

