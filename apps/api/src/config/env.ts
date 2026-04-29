import path from "node:path";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../..", ".env") });

export const env = {
  host: process.env.API_HOST ?? "0.0.0.0",
  port: Number(process.env.PORT ?? 3001)
};
