import express from "express";
import * as path from "path";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import initializeSiteConfig from "./libs/initializeSiteConfig";

const app = express();

/**
 * -------------------------------------------------------
 * BASIC CONFIG
 * -------------------------------------------------------
 */

app.set("trust proxy", 1);

/**
 * -------------------------------------------------------
 * CORS
 * -------------------------------------------------------
 *
 * For local Docker testing we allow the three frontend
 * applications.
 */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

/**
 * -------------------------------------------------------
 * MIDDLEWARE
 * -------------------------------------------------------
 */

app.use(morgan("combined"));

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use(cookieParser());

app.use("/assets", express.static(path.join(__dirname, "assets")));

/**
 * -------------------------------------------------------
 * RATE LIMIT
 * -------------------------------------------------------
 *
 * Do NOT create a custom keyGenerator based on req.ip.
 * express-rate-limit v8 already handles IPv6 correctly.
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 1000,

  message: {
    error: "Too many requests, please try again later.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

/**
 * -------------------------------------------------------
 * HEALTH CHECK
 * -------------------------------------------------------
 */

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "api-gateway",
  });
});

/**
 * -------------------------------------------------------
 * MICROSERVICE PROXIES
 * -------------------------------------------------------
 *
 * IMPORTANT:
 *
 * Inside Docker Compose:
 *
 * localhost = current container
 *
 * Therefore we MUST use Docker service names.
 */

/**
 * Recommendation service
 */
app.use("/recommendation", proxy("http://recommendation-service:6007"));

/**
 * Chatting service
 */
app.use("/chatting", proxy("http://chatting-service:6006"));

/**
 * Admin service
 */
app.use("/admin", proxy("http://admin-service:6005"));

/**
 * Order service
 */
app.use("/order", proxy("http://order-service:6004"));

/**
 * Seller service
 */
app.use("/seller", proxy("http://seller-service:6003"));

/**
 * Product service
 */
app.use("/product", proxy("http://products-service:6002"));

/**
 * Auth service
 *
 * This must remain last because it handles "/".
 */
app.use("/", proxy("http://auth-service:6001"));

/**
 * -------------------------------------------------------
 * 404 HANDLER
 * -------------------------------------------------------
 */

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

/**
 * -------------------------------------------------------
 * ERROR HANDLER
 * -------------------------------------------------------
 */

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("API Gateway error:", err);

    if (res.headersSent) {
      return next(err);
    }

    res.status(500).json({
      error: "Internal server error",
    });
  },
);

/**
 * -------------------------------------------------------
 * SERVER
 * -------------------------------------------------------
 */

const port = Number(process.env.PORT) || 8080;

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`API Gateway listening on port ${port}`);

  try {
    initializeSiteConfig();

    console.log("Site config initialized successfully");
  } catch (error) {
    console.error("Failed to initialize site config:", error);
  }
});

server.on("error", console.error);
