import cors from "cors";
import express from "express";
import apiRouter from "./routes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/api/v1", apiRouter);

  app.use((_req, res) => {
    res.status(404).json({
      code: "ROUTE_NOT_FOUND",
      message: "API route not found."
    });
  });

  return app;
}
