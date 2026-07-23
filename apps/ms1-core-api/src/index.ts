import express from "express";
import cors from "cors";
import helmet from "helmet";

import { config } from "./config";
import { logger } from "./utils/logger";
import { createApiResponse } from "./features/authentication/utils";
import { generalLimiter } from "./middlewares/rateLimiter";

import apiRoutes from "./routes";


const app = express();

const PORT = config.port;

// ---------------------------------------------------------------------------
// TRUST PROXY
// ---------------------------------------------------------------------------
// Production topology: Internet → Nginx (EC2 host) → Docker bridge → MS1 :3001
//
// Setting trust proxy to 1 tells Express to trust exactly ONE upstream hop
// (Nginx) and read the real client IP from the first X-Forwarded-For entry.
// This is required so that express-rate-limit uses the client IP, not the
// Docker bridge gateway IP (which would cause all clients to share one bucket).
//
// ⚠️  SECURITY REQUIREMENT: This setting is safe ONLY if TCP port 3001 is
// blocked at the AWS Security Group / host firewall level so that external
// clients cannot connect directly to MS1 and inject a spoofed
// X-Forwarded-For header. If port 3001 is publicly reachable, an attacker
// can bypass rate limiting by forging X-Forwarded-For.
// ---------------------------------------------------------------------------
app.set("trust proxy", 1);


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

// Apply the general API limiter to every /api/* route.
// /health is at the root path and is deliberately outside this prefix.
app.use(
  "/api",
  generalLimiter,
  apiRoutes
);



app.get(
  "/health",
  (req, res) => {

    res.json(
      createApiResponse(
        true,
        "Server is running"
      )
    );

  }
);





// Global error handler

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {


    logger.error(err);


    res.status(500)
    .json(
      createApiResponse(
        false,
        "Internal server error"
      )
    );


  }
);





app.listen(
  PORT,
  () => {

    logger.info(
      `MS1 Core API running on port ${PORT}`
    );

  }
);