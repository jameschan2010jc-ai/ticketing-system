import type {
  AdminParkConfig,
  AdminTicketType,
  CreateParkConfigRequest,
  CreateTicketTypeRequest,
  UpdateParkConfigRequest,
  UpdateTicketTypeRequest
} from "@packages/shared-types";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getMysqlPool } from "../config/database";

interface ParkRow extends RowDataPacket {
  park_id: string;
  park_name: string;
  intro_text: string;
  hero_image_url: string;
  open_date_start: Date | string;
  open_date_end: Date | string;
  timezone: string;
  currency: string;
  booking_window_days: number;
  max_tickets_per_order: number;
  enable_credit_card: number | boolean;
  enable_line_pay: number | boolean;
  status: "active" | "inactive";
  updated_at: Date | string;
}

interface TicketTypeRow extends RowDataPacket {
  ticket_type_id: string;
  park_id: string;
  ticket_name: string;
  description: string;
  price_amount: number | string;
  currency: string;
  is_verification_required: number | boolean;
  is_active: number | boolean;
  sale_start_date: Date | string;
  sale_end_date: Date | string;
  visit_start_date: Date | string;
  visit_end_date: Date | string;
  daily_cap_qty: number;
  period_cap_qty: number;
  remaining_quantity: number;
  updated_at: Date | string;
}

let schemaPromise: Promise<void> | null = null;

export async function listParks() {
  await ensureAdminConfigTables();

  const pool = getMysqlPool();
  const [rows] = await pool.execute<ParkRow[]>(
    `SELECT park_id, park_name, status
    FROM parks
    ORDER BY park_id`
  );

  return rows.map((row) => ({
    name: row.park_name,
    parkId: row.park_id,
    status: row.status
  }));
}

export async function getParkConfig(parkId: string) {
  await ensureAdminConfigTables();

  const pool = getMysqlPool();
  const [rows] = await pool.execute<ParkRow[]>(
    `SELECT
      park_id,
      park_name,
      intro_text,
      hero_image_url,
      open_date_start,
      open_date_end,
      timezone,
      currency,
      booking_window_days,
      max_tickets_per_order,
      enable_credit_card,
      enable_line_pay,
      status,
      updated_at
    FROM parks
    WHERE park_id = :parkId`,
    { parkId }
  );

  return rows[0] ? mapPark(rows[0]) : null;
}

export async function createParkConfig(request: CreateParkConfigRequest) {
  await ensureAdminConfigTables();

  const pool = getMysqlPool();
  const now = new Date();
  await pool.execute<ResultSetHeader>(
    `INSERT INTO parks (
      park_id,
      park_name,
      intro_text,
      hero_image_url,
      open_date_start,
      open_date_end,
      timezone,
      currency,
      booking_window_days,
      max_tickets_per_order,
      enable_credit_card,
      enable_line_pay,
      status,
      created_at,
      updated_at
    ) VALUES (
      :parkId,
      :name,
      :intro,
      :heroImageUrl,
      :openDateStart,
      :openDateEnd,
      :timezone,
      :currency,
      :bookingWindowDays,
      :maxTicketsPerOrder,
      :enableCreditCard,
      :enableLinePay,
      :status,
      :createdAt,
      :updatedAt
    )`,
    {
      bookingWindowDays: request.bookingWindowDays,
      createdAt: now,
      currency: request.currency,
      enableCreditCard: request.enableCreditCard,
      enableLinePay: request.enableLinePay,
      heroImageUrl: request.heroImageUrl,
      intro: request.intro,
      maxTicketsPerOrder: request.maxTicketsPerOrder,
      name: request.name,
      openDateEnd: request.openDateEnd,
      openDateStart: request.openDateStart,
      parkId: request.parkId,
      status: request.status,
      timezone: request.timezone,
      updatedAt: now
    }
  );

  const created = await getParkConfig(request.parkId);

  if (!created) {
    throw new Error("PARK_CREATE_READBACK_FAILED");
  }

  return created;
}

export async function updateParkConfig(
  parkId: string,
  request: UpdateParkConfigRequest
) {
  await ensureAdminConfigTables();

  const pool = getMysqlPool();
  await pool.execute(
    `UPDATE parks
    SET park_name = :name,
      intro_text = :intro,
      hero_image_url = :heroImageUrl,
      open_date_start = :openDateStart,
      open_date_end = :openDateEnd,
      timezone = :timezone,
      currency = :currency,
      booking_window_days = :bookingWindowDays,
      max_tickets_per_order = :maxTicketsPerOrder,
      enable_credit_card = :enableCreditCard,
      enable_line_pay = :enableLinePay,
      status = :status,
      updated_at = :updatedAt
    WHERE park_id = :parkId`,
    {
      bookingWindowDays: request.bookingWindowDays,
      currency: request.currency,
      enableCreditCard: request.enableCreditCard,
      enableLinePay: request.enableLinePay,
      heroImageUrl: request.heroImageUrl,
      intro: request.intro,
      maxTicketsPerOrder: request.maxTicketsPerOrder,
      name: request.name,
      openDateEnd: request.openDateEnd,
      openDateStart: request.openDateStart,
      parkId,
      status: request.status,
      timezone: request.timezone,
      updatedAt: new Date()
    }
  );

  const updated = await getParkConfig(parkId);

  if (!updated) {
    throw new Error("PARK_NOT_FOUND");
  }

  return updated;
}

export async function setParkStatus(
  parkId: string,
  status: AdminParkConfig["status"]
) {
  await ensureAdminConfigTables();

  const pool = getMysqlPool();
  await pool.execute<ResultSetHeader>(
    `UPDATE parks
    SET status = :status,
      updated_at = :updatedAt
    WHERE park_id = :parkId`,
    { parkId, status, updatedAt: new Date() }
  );

  const updated = await getParkConfig(parkId);

  if (!updated) {
    throw new Error("PARK_NOT_FOUND");
  }

  return updated;
}

export async function deleteParkConfig(parkId: string) {
  await ensureAdminConfigTables();

  const pool = getMysqlPool();
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM ticket_types WHERE park_id = :parkId`,
    { parkId }
  );
  void result;
  const [parkResult] = await pool.execute<ResultSetHeader>(
    `DELETE FROM parks WHERE park_id = :parkId`,
    { parkId }
  );

  if (parkResult.affectedRows === 0) {
    throw new Error("PARK_NOT_FOUND");
  }
}

export async function listTicketTypes(parkId: string, includeInactive = false) {
  await ensureAdminConfigTables();

  const pool = getMysqlPool();
  const [rows] = await pool.execute<TicketTypeRow[]>(
    `SELECT
      ticket_type_id,
      park_id,
      ticket_name,
      description,
      price_amount,
      currency,
      is_verification_required,
      is_active,
      sale_start_date,
      sale_end_date,
      visit_start_date,
      visit_end_date,
      daily_cap_qty,
      period_cap_qty,
      remaining_quantity,
      updated_at
    FROM ticket_types
    WHERE park_id = :parkId
      AND (:includeInactive = true OR is_active = true)
    ORDER BY ticket_type_id`,
    { includeInactive, parkId }
  );

  return rows.map(mapTicketType);
}

export async function createTicketType(
  parkId: string,
  request: CreateTicketTypeRequest
) {
  await ensureAdminConfigTables();

  const pool = getMysqlPool();
  const now = new Date();
  await pool.execute<ResultSetHeader>(
    `INSERT INTO ticket_types (
      ticket_type_id,
      park_id,
      ticket_name,
      description,
      price_amount,
      currency,
      is_verification_required,
      is_active,
      sale_start_date,
      sale_end_date,
      visit_start_date,
      visit_end_date,
      daily_cap_qty,
      period_cap_qty,
      remaining_quantity,
      created_at,
      updated_at
    ) VALUES (
      :ticketTypeId,
      :parkId,
      :name,
      :description,
      :price,
      :currency,
      :requiresIdVerification,
      :isActive,
      :saleStartDate,
      :saleEndDate,
      :visitStartDate,
      :visitEndDate,
      :dailyCapQuantity,
      :periodCapQuantity,
      :remainingQuantity,
      :createdAt,
      :updatedAt
    )`,
    {
      createdAt: now,
      currency: request.currency,
      dailyCapQuantity: request.dailyCapQuantity,
      description: request.description,
      isActive: request.isActive,
      name: request.name,
      parkId,
      periodCapQuantity: request.periodCapQuantity,
      price: request.price,
      remainingQuantity: request.remainingQuantity,
      requiresIdVerification: request.requiresIdVerification,
      saleEndDate: request.saleEndDate,
      saleStartDate: request.saleStartDate,
      ticketTypeId: request.ticketTypeId,
      updatedAt: now,
      visitEndDate: request.visitEndDate,
      visitStartDate: request.visitStartDate
    }
  );

  const created = await getTicketType(parkId, request.ticketTypeId);

  if (!created) {
    throw new Error("TICKET_TYPE_CREATE_READBACK_FAILED");
  }

  return created;
}

export async function updateTicketType(
  parkId: string,
  ticketTypeId: string,
  request: UpdateTicketTypeRequest
) {
  await ensureAdminConfigTables();

  const pool = getMysqlPool();
  await pool.execute(
    `UPDATE ticket_types
    SET ticket_name = :name,
      description = :description,
      price_amount = :price,
      currency = :currency,
      is_verification_required = :requiresIdVerification,
      is_active = :isActive,
      sale_start_date = :saleStartDate,
      sale_end_date = :saleEndDate,
      visit_start_date = :visitStartDate,
      visit_end_date = :visitEndDate,
      daily_cap_qty = :dailyCapQuantity,
      period_cap_qty = :periodCapQuantity,
      remaining_quantity = :remainingQuantity,
      updated_at = :updatedAt
    WHERE park_id = :parkId
      AND ticket_type_id = :ticketTypeId`,
    {
      currency: request.currency,
      dailyCapQuantity: request.dailyCapQuantity,
      description: request.description,
      isActive: request.isActive,
      name: request.name,
      parkId,
      periodCapQuantity: request.periodCapQuantity,
      price: request.price,
      remainingQuantity: request.remainingQuantity,
      requiresIdVerification: request.requiresIdVerification,
      saleEndDate: request.saleEndDate,
      saleStartDate: request.saleStartDate,
      ticketTypeId,
      updatedAt: new Date(),
      visitEndDate: request.visitEndDate,
      visitStartDate: request.visitStartDate
    }
  );

  const ticket = await getTicketType(parkId, ticketTypeId);

  if (!ticket) {
    throw new Error("TICKET_TYPE_NOT_FOUND");
  }

  return ticket;
}

export async function setTicketTypeStatus(
  parkId: string,
  ticketTypeId: string,
  isActive: boolean
) {
  await ensureAdminConfigTables();

  const pool = getMysqlPool();
  await pool.execute<ResultSetHeader>(
    `UPDATE ticket_types
    SET is_active = :isActive,
      updated_at = :updatedAt
    WHERE park_id = :parkId
      AND ticket_type_id = :ticketTypeId`,
    {
      isActive,
      parkId,
      ticketTypeId,
      updatedAt: new Date()
    }
  );

  const ticket = await getTicketType(parkId, ticketTypeId);

  if (!ticket) {
    throw new Error("TICKET_TYPE_NOT_FOUND");
  }

  return ticket;
}

export async function deleteTicketType(parkId: string, ticketTypeId: string) {
  await ensureAdminConfigTables();

  const pool = getMysqlPool();
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM ticket_types
    WHERE park_id = :parkId
      AND ticket_type_id = :ticketTypeId`,
    { parkId, ticketTypeId }
  );

  if (result.affectedRows === 0) {
    throw new Error("TICKET_TYPE_NOT_FOUND");
  }
}

export async function getTicketType(parkId: string, ticketTypeId: string) {
  const tickets = await listTicketTypes(parkId, true);
  return tickets.find((ticket) => ticket.ticketTypeId === ticketTypeId) ?? null;
}

export function ensureAdminConfigTables() {
  schemaPromise ??= createAdminConfigTables();
  return schemaPromise;
}

async function createAdminConfigTables() {
  const pool = getMysqlPool();
  const now = new Date();

  await pool.query(`CREATE TABLE IF NOT EXISTS parks (
    park_id varchar(64) NOT NULL PRIMARY KEY,
    park_name varchar(255) NOT NULL,
    intro_text text NOT NULL,
    hero_image_url text NOT NULL,
    open_date_start date NOT NULL,
    open_date_end date NOT NULL,
    timezone varchar(64) NOT NULL,
    currency varchar(8) NOT NULL,
    booking_window_days int NOT NULL,
    max_tickets_per_order int NOT NULL,
    enable_credit_card tinyint(1) NOT NULL DEFAULT 1,
    enable_line_pay tinyint(1) NOT NULL DEFAULT 1,
    status varchar(20) NOT NULL,
    created_at datetime(3) NOT NULL,
    updated_at datetime(3) NOT NULL
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS ticket_types (
    ticket_type_id varchar(64) NOT NULL PRIMARY KEY,
    park_id varchar(64) NOT NULL,
    ticket_name varchar(255) NOT NULL,
    description text NOT NULL,
    price_amount decimal(12,2) NOT NULL,
    currency varchar(8) NOT NULL,
    is_verification_required tinyint(1) NOT NULL DEFAULT 0,
    is_active tinyint(1) NOT NULL DEFAULT 1,
    sale_start_date date NOT NULL,
    sale_end_date date NOT NULL,
    visit_start_date date NOT NULL,
    visit_end_date date NOT NULL,
    daily_cap_qty int NOT NULL,
    period_cap_qty int NOT NULL,
    remaining_quantity int NOT NULL,
    created_at datetime(3) NOT NULL,
    updated_at datetime(3) NOT NULL,
    INDEX idx_ticket_types_park_active (park_id, is_active)
  )`);

  await pool.execute(
    `INSERT IGNORE INTO parks (
      park_id,
      park_name,
      intro_text,
      hero_image_url,
      open_date_start,
      open_date_end,
      timezone,
      currency,
      booking_window_days,
      max_tickets_per_order,
      enable_credit_card,
      enable_line_pay,
      status,
      created_at,
      updated_at
    ) VALUES (
      'demo-park',
      'Smart Scenic Park',
      'Plan your visit, choose an entry time, and keep your QR ticket ready for fast admission.',
      '/images/demo-park.jpg',
      '2026-05-01',
      '2026-12-31',
      'Asia/Taipei',
      'TWD',
      14,
      1,
      true,
      true,
      'active',
      :now,
      :now
    )`,
    { now }
  );
  await pool.execute(
    `INSERT IGNORE INTO parks (
      park_id,
      park_name,
      intro_text,
      hero_image_url,
      open_date_start,
      open_date_end,
      timezone,
      currency,
      booking_window_days,
      max_tickets_per_order,
      enable_credit_card,
      enable_line_pay,
      status,
      created_at,
      updated_at
    ) VALUES (
      'north-park',
      'North Park',
      'Configure this park before opening sales.',
      '/images/north-park.jpg',
      '2026-05-01',
      '2026-12-31',
      'Asia/Taipei',
      'TWD',
      14,
      1,
      true,
      true,
      'inactive',
      :now,
      :now
    )`,
    { now }
  );
  await seedTicketTypes("demo-park", now);
  await seedTicketTypes("north-park", now);
}

async function seedTicketTypes(parkId: string, now: Date) {
  const pool = getMysqlPool();
  await pool.execute(
    `INSERT IGNORE INTO ticket_types (
      ticket_type_id,
      park_id,
      ticket_name,
      description,
      price_amount,
      currency,
      is_verification_required,
      is_active,
      sale_start_date,
      sale_end_date,
      visit_start_date,
      visit_end_date,
      daily_cap_qty,
      period_cap_qty,
      remaining_quantity,
      created_at,
      updated_at
    ) VALUES (
      :adultId,
      :parkId,
      'Adult Ticket',
      'Standard admission ticket.',
      180,
      'TWD',
      false,
      true,
      '2026-04-01',
      '2026-12-31',
      '2026-05-01',
      '2026-12-31',
      300,
      5000,
      120,
      :now,
      :now
    ), (
      :discountId,
      :parkId,
      'Discount Ticket',
      'Verification-required ticket type.',
      120,
      'TWD',
      true,
      true,
      '2026-04-01',
      '2026-12-31',
      '2026-05-01',
      '2026-12-31',
      100,
      2000,
      40,
      :now,
      :now
    )`,
    {
      adultId: `${parkId}-adult`,
      discountId: `${parkId}-discount`,
      now,
      parkId
    }
  );
}

function mapPark(row: ParkRow): AdminParkConfig {
  return {
    bookingWindowDays: Number(row.booking_window_days),
    currency: row.currency,
    enableCreditCard: Boolean(row.enable_credit_card),
    enableLinePay: Boolean(row.enable_line_pay),
    heroImageUrl: row.hero_image_url,
    intro: row.intro_text,
    maxTicketsPerOrder: Number(row.max_tickets_per_order) as 1,
    name: row.park_name,
    openDateEnd: toDateString(row.open_date_end),
    openDateStart: toDateString(row.open_date_start),
    parkId: row.park_id,
    status: row.status,
    timezone: row.timezone,
    updatedAt: toIsoString(row.updated_at)
  };
}

function mapTicketType(row: TicketTypeRow): AdminTicketType {
  return {
    currency: row.currency,
    dailyCapQuantity: Number(row.daily_cap_qty),
    description: row.description,
    isActive: Boolean(row.is_active),
    name: row.ticket_name,
    parkId: row.park_id,
    periodCapQuantity: Number(row.period_cap_qty),
    price: Number(row.price_amount),
    remainingQuantity: Number(row.remaining_quantity),
    requiresIdVerification: Boolean(row.is_verification_required),
    saleEndDate: toDateString(row.sale_end_date),
    saleStartDate: toDateString(row.sale_start_date),
    ticketTypeId: row.ticket_type_id,
    updatedAt: toIsoString(row.updated_at),
    visitEndDate: toDateString(row.visit_end_date),
    visitStartDate: toDateString(row.visit_start_date)
  };
}

function toDateString(value: Date | string) {
  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  return value.toISOString().slice(0, 10);
}

function toIsoString(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return new Date(value).toISOString();
}
