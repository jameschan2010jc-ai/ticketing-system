import { randomUUID } from "node:crypto";
import type {
  RegisterUserRequest,
  UserListItem,
  UserStatus
} from "@packages/shared-types";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getMysqlPool } from "../config/database";
import { ensureCommerceTables } from "./order.repository";

interface UserRow extends RowDataPacket {
  user_id: string;
  account_type: "phone" | "email";
  phone_e164: string | null;
  email: string | null;
  display_name: string;
  status: UserStatus;
  order_count: number | string;
  total_amount_spent: number | string | null;
  total_ticket_count: number | string | null;
  unused_ticket_count: number | string | null;
  created_at: Date | string;
  password_changed_at: Date | string | null;
}

interface CountRow extends RowDataPacket {
  total: number;
}

let schemaPromise: Promise<void> | null = null;

export async function createUser(request: RegisterUserRequest) {
  await ensureUserTables();

  const existing = await findUserByAccount(request.account);

  if (existing) {
    return existing;
  }

  const pool = getMysqlPool();
  const userId = randomUUID();
  const now = new Date();
  await pool.execute<ResultSetHeader>(
    `INSERT INTO users (
      user_id,
      account_type,
      phone_e164,
      email,
      display_name,
      status,
      created_at,
      updated_at,
      password_changed_at
    ) VALUES (
      :userId,
      :accountType,
      :phone,
      :email,
      :displayName,
      'active',
      :createdAt,
      :updatedAt,
      :passwordChangedAt
    )`,
    {
      accountType: request.accountType,
      createdAt: now,
      displayName: request.account,
      email: request.accountType === "email" ? request.account : null,
      passwordChangedAt: now,
      phone: request.accountType === "phone" ? request.account : null,
      updatedAt: now,
      userId
    }
  );

  const created = await findUserById(userId);

  if (!created) {
    throw new Error("USER_CREATE_READBACK_FAILED");
  }

  return created;
}

export async function findUserByAccount(account: string) {
  await ensureUserTables();

  const pool = getMysqlPool();
  const [rows] = await pool.execute<UserRow[]>(
    `${userSelectSql()}
    WHERE u.phone_e164 = :account
      OR u.email = :account
    LIMIT 1`,
    { account, parkId: "demo-park" }
  );

  return rows[0] ? mapUser(rows[0]) : null;
}

export async function findUserById(userId: string) {
  await ensureUserTables();

  const pool = getMysqlPool();
  const [rows] = await pool.execute<UserRow[]>(
    `${userSelectSql()}
    WHERE u.user_id = :userId
    LIMIT 1`,
    { parkId: "demo-park", userId }
  );

  return rows[0] ? mapUser(rows[0]) : null;
}

export async function listUsers(parkId: string, page: number, pageSize: number) {
  await ensureUserTables();

  const safePage = Math.max(1, page);
  const safePageSize = Math.min(100, Math.max(1, pageSize));
  const offset = (safePage - 1) * safePageSize;
  const pool = getMysqlPool();
  const [countRows] = await pool.execute<CountRow[]>(
    "SELECT COUNT(*) AS total FROM users"
  );
  const totalItems = Number(countRows[0]?.total ?? 0);
  const [rows] = await pool.execute<UserRow[]>(
    `${userSelectSql()}
    ORDER BY u.created_at DESC
    LIMIT ${safePageSize} OFFSET ${offset}`,
    { parkId }
  );

  return {
    items: rows.map(mapUser),
    pageInfo: {
      page: safePage,
      pageSize: safePageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / safePageSize)
    }
  };
}

export function ensureUserTables() {
  schemaPromise ??= createUserTables();
  return schemaPromise;
}

async function createUserTables() {
  const pool = getMysqlPool();

  await ensureCommerceTables();
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    user_id varchar(36) NOT NULL PRIMARY KEY,
    account_type varchar(20) NOT NULL,
    phone_e164 varchar(64) NULL,
    email varchar(255) NULL,
    display_name varchar(255) NOT NULL,
    status varchar(30) NOT NULL,
    created_at datetime(3) NOT NULL,
    updated_at datetime(3) NOT NULL,
    password_changed_at datetime(3) NULL,
    UNIQUE KEY uq_users_phone (phone_e164),
    UNIQUE KEY uq_users_email (email),
    INDEX idx_users_created (created_at)
  )`);
  await addPasswordChangedAtColumnIfMissing();
}

function userSelectSql() {
  return `SELECT
    u.user_id,
    u.account_type,
    u.phone_e164,
    u.email,
    u.display_name,
    u.status,
    u.created_at,
    u.password_changed_at,
    (
      SELECT COUNT(*)
      FROM orders o
      WHERE o.user_id = u.user_id
        AND o.park_id = :parkId
    ) AS order_count
    ,
    (
      SELECT COALESCE(SUM(o.total_amount), 0)
      FROM orders o
      WHERE o.user_id = u.user_id
        AND o.park_id = :parkId
        AND o.order_status = 'paid'
    ) AS total_amount_spent,
    (
      SELECT COUNT(*)
      FROM tickets t
      JOIN orders o ON o.order_id = t.order_id
      WHERE o.user_id = u.user_id
        AND o.park_id = :parkId
    ) AS total_ticket_count,
    (
      SELECT COUNT(*)
      FROM tickets t
      JOIN orders o ON o.order_id = t.order_id
      WHERE o.user_id = u.user_id
        AND o.park_id = :parkId
        AND t.ticket_status = 'unused'
        AND t.valid_to >= NOW(3)
    ) AS unused_ticket_count
  FROM users u`;
}

function mapUser(row: UserRow): UserListItem {
  return {
    account: row.account_type === "email" ? row.email ?? "" : row.phone_e164 ?? "",
    accountType: row.account_type,
    createdAt: toIsoString(row.created_at),
    displayName: row.display_name,
    lastPasswordChangedAt: toNullableIsoString(row.password_changed_at),
    orderCount: Number(row.order_count),
    status: row.status,
    totalAmountSpent: Number(row.total_amount_spent ?? 0),
    totalTicketCount: Number(row.total_ticket_count ?? 0),
    unusedTicketCount: Number(row.unused_ticket_count ?? 0),
    userId: row.user_id
  };
}

async function addPasswordChangedAtColumnIfMissing() {
  const pool = getMysqlPool();

  try {
    await pool.query(
      `ALTER TABLE users
      ADD COLUMN password_changed_at datetime(3) NULL AFTER updated_at`
    );
  } catch (error) {
    if (!isDuplicateColumnError(error)) {
      throw error;
    }
  }
}

function isDuplicateColumnError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ER_DUP_FIELDNAME"
  );
}

function toIsoString(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}

function toNullableIsoString(value: Date | string | null) {
  return value ? toIsoString(value) : null;
}
