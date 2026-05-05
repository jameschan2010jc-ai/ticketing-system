import path from "node:path";
import mysql, { type Pool } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../..", ".env") });

export interface MysqlConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export const mysqlConfig: MysqlConfig = {
  host: process.env.MYSQL_HOST ?? "127.0.0.1",
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: process.env.MYSQL_USER ?? "ticketing_app",
  password: process.env.MYSQL_PASSWORD ?? "",
  database: process.env.MYSQL_DATABASE ?? "ticketing_app"
};

let pool: Pool | null = null;

export function getMysqlPool() {
  pool ??= mysql.createPool({
    ...mysqlConfig,
    connectionLimit: 10,
    decimalNumbers: false,
    namedPlaceholders: true,
    timezone: "Z",
    waitForConnections: true
  });

  return pool;
}
