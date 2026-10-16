const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./config/swagger");
const securityHeaders = require("./middleware/securityHeaders");
const { apiLimiter } = require("./middleware/rateLimit");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const apiRoutes = require("./routes/api");

function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", true);

  const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
    ],
    credentials: false,
  };
  app.use("/api", cors(corsOptions));

  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(securityHeaders);

  app.get("/up", (req, res) => res.status(200).json({ status: "ok" }));

  app.get("/api/docs", (req, res) => {
    res.type("html").send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Karhutla API Docs</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>SwaggerUIBundle({ url: "/api/docs.json", dom_id: "#swagger-ui" });</script>
</body>
</html>`);
  });
  app.get("/api/docs.json", (req, res) => res.json(swaggerSpec));

  app.use("/api", apiLimiter, apiRoutes);

  app.use("/api", notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
