import { randomUUID } from "node:crypto";
import type {
  OrderDetail,
  OrderItemSummary,
  OrderListItem,
  OrderSource,
  OrderStatus,
  PageInfo,
  PaymentMethod,
  PaymentStatus,
  PaymentSummary,
  TicketListItem,
  TicketStatus,
  TicketSummary
} from "@packages/shared-types";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { getMysqlPool } from "../config/database";

export interface OrderSnapshot {
  parkId: string;
  userId: string | null;
  orderSource: OrderSource;
  visitDate: string;
  entryTimeStart: string;
  entryTimeEnd: string;
  ticketTypeId: string;
  ticketName: string;
  unitPrice: number;
  quantity: 1;
  requiresVerification: boolean;
  verificationStatus: OrderItemSummary["verificationStatus"];
  currency: string;
}

export interface OrderListFilters {
  createdFrom?: string;
  createdTo?: string;
  orderNo?: string;
  parkId?: string;
  paymentMethod?: PaymentMethod;
  status?: OrderStatus;
  userId?: string;
  userKeyword?: string;
  visitDate?: string;
}

export interface PaginatedOrderList {
  items: OrderListItem[];
  pageInfo: PageInfo;
}

export interface TicketListFilters {
  userId?: string;
}

export interface PaginatedTicketList {
  items: TicketListItem[];
  pageInfo: PageInfo;
}

interface OrderRow extends RowDataPacket {
  order_id: string;
  park_id: string;
  user_id: string | null;
  order_no: string;
  order_source: OrderSource;
  order_status: OrderStatus;
  visit_date: Date | string;
  entry_time_start: string;
  entry_time_end: string;
  total_amount: number | string;
  currency: string;
  created_at: Date | string;
  paid_at: Date | string | null;
}

interface OrderItemRow extends RowDataPacket {
  order_item_id: string;
  ticket_type_id: string;
  ticket_name_snapshot: string;
  unit_price_snapshot: number | string;
  qty: number;
  requires_verification: number | boolean;
  verification_status: OrderItemSummary["verificationStatus"];
}

interface PaymentRow extends RowDataPacket {
  payment_id: string;
  method: PaymentMethod;
  payment_status: PaymentStatus;
  amount: number | string;
  paid_at: Date | string | null;
}

interface TicketRow extends RowDataPacket {
  ticket_id: string;
  ticket_no: string;
  ticket_status: TicketStatus;
  valid_from: Date | string;
  valid_to: Date | string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface OrderListRow extends RowDataPacket {
  order_id: string;
  order_no: string;
  order_status: OrderStatus;
  user_name: string | null;
  visit_date: Date | string;
  entry_time_start: string;
  entry_time_end: string;
  total_amount: number | string;
  currency: string;
  created_at: Date | string;
  paid_at: Date | string | null;
  ticket_type_id: string | null;
  ticket_name: string | null;
  ticket_price: number | string | null;
  ticket_quantity: number | string | null;
  verification_status: OrderItemSummary["verificationStatus"] | null;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus | null;
  qr_code: string | null;
}

interface TicketListRow extends RowDataPacket {
  ticket_id: string;
  ticket_no: string;
  ticket_status: TicketStatus;
  valid_from: Date | string;
  valid_to: Date | string;
  issued_at: Date | string;
  order_id: string;
  order_no: string;
  visit_date: Date | string;
  entry_time_start: string;
  entry_time_end: string;
  paid_at: Date | string | null;
  ticket_name: string;
}

let schemaPromise: Promise<void> | null = null;

export async function createOrder(snapshot: OrderSnapshot) {
  await ensureCommerceTables();

  const pool = getMysqlPool();
  const connection = await pool.getConnection();
  const orderId = randomUUID();
  const orderItemId = randomUUID();
  const orderNo = createOrderNo();
  const now = new Date();

  try {
    await connection.beginTransaction();
    await connection.execute(
      `INSERT INTO orders (
        order_id,
        park_id,
        user_id,
        order_no,
        order_source,
        order_status,
        visit_date,
        entry_time_start,
        entry_time_end,
        total_amount,
        currency,
        created_at
      ) VALUES (
        :orderId,
        :parkId,
        :userId,
        :orderNo,
        :orderSource,
        'pending_payment',
        :visitDate,
        :entryTimeStart,
        :entryTimeEnd,
        :totalAmount,
        :currency,
        :createdAt
      )`,
      {
        createdAt: now,
        currency: snapshot.currency,
        entryTimeEnd: snapshot.entryTimeEnd,
        entryTimeStart: snapshot.entryTimeStart,
        orderId,
        orderNo,
        orderSource: snapshot.orderSource,
        parkId: snapshot.parkId,
        totalAmount: snapshot.unitPrice * snapshot.quantity,
        userId: snapshot.userId,
        visitDate: snapshot.visitDate
      }
    );
    await connection.execute(
      `INSERT INTO order_items (
        order_item_id,
        order_id,
        ticket_type_id,
        ticket_name_snapshot,
        unit_price_snapshot,
        qty,
        requires_verification,
        verification_status
      ) VALUES (
        :orderItemId,
        :orderId,
        :ticketTypeId,
        :ticketName,
        :unitPrice,
        :quantity,
        :requiresVerification,
        :verificationStatus
      )`,
      {
        orderId,
        orderItemId,
        quantity: snapshot.quantity,
        requiresVerification: snapshot.requiresVerification,
        ticketName: snapshot.ticketName,
        ticketTypeId: snapshot.ticketTypeId,
        unitPrice: snapshot.unitPrice,
        verificationStatus: snapshot.verificationStatus
      }
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  const order = await findOrderById(orderId);

  if (!order) {
    throw new Error("ORDER_CREATE_READBACK_FAILED");
  }

  return order;
}

export async function findOrderById(orderId: string) {
  await ensureCommerceTables();

  const pool = getMysqlPool();
  const [orderRows] = await pool.execute<OrderRow[]>(
    `SELECT
      order_id,
      park_id,
      user_id,
      order_no,
      order_source,
      order_status,
      visit_date,
      entry_time_start,
      entry_time_end,
      total_amount,
      currency,
      created_at,
      paid_at
    FROM orders
    WHERE order_id = :orderId`,
    { orderId }
  );
  const order = orderRows[0];

  if (!order) {
    return null;
  }

  const [itemRows] = await pool.execute<OrderItemRow[]>(
    `SELECT
      order_item_id,
      ticket_type_id,
      ticket_name_snapshot,
      unit_price_snapshot,
      qty,
      requires_verification,
      verification_status
    FROM order_items
    WHERE order_id = :orderId
    ORDER BY order_item_id`,
    { orderId }
  );
  const [paymentRows] = await pool.execute<PaymentRow[]>(
    `SELECT
      payment_id,
      method,
      payment_status,
      amount,
      paid_at
    FROM payments
    WHERE order_id = :orderId
    ORDER BY paid_at DESC, payment_id DESC`,
    { orderId }
  );
  const [ticketRows] = await pool.execute<TicketRow[]>(
    `SELECT
      ticket_id,
      ticket_no,
      ticket_status,
      valid_from,
      valid_to
    FROM tickets
    WHERE order_id = :orderId
    ORDER BY created_at DESC, ticket_id DESC`,
    { orderId }
  );

  return mapOrderDetail(order, itemRows, paymentRows, ticketRows);
}

export async function listOrders(
  filters: OrderListFilters,
  page: number,
  pageSize: number
): Promise<PaginatedOrderList> {
  await ensureCommerceTables();

  const safePage = Math.max(1, page);
  const safePageSize = Math.min(100, Math.max(1, pageSize));
  const offset = (safePage - 1) * safePageSize;
  const params: Record<string, number | string> = {};
  const whereSql = buildOrderWhere(filters, params);
  const pool = getMysqlPool();
  const [countRows] = await pool.execute<CountRow[]>(
    `SELECT COUNT(*) AS total FROM orders o ${whereSql}`,
    params
  );
  const totalItems = Number(countRows[0]?.total ?? 0);
  const [rows] = await pool.execute<OrderListRow[]>(
    `SELECT
      o.order_id,
      o.order_no,
      o.order_status,
      COALESCE(u.display_name, o.user_id, 'Guest') AS user_name,
      o.visit_date,
      o.entry_time_start,
      o.entry_time_end,
      o.total_amount,
      o.currency,
      o.created_at,
      o.paid_at,
      (
        SELECT oi.ticket_type_id
        FROM order_items oi
        WHERE oi.order_id = o.order_id
        ORDER BY oi.order_item_id
        LIMIT 1
      ) AS ticket_type_id,
      (
        SELECT oi.ticket_name_snapshot
        FROM order_items oi
        WHERE oi.order_id = o.order_id
        ORDER BY oi.order_item_id
        LIMIT 1
      ) AS ticket_name,
      (
        SELECT oi.unit_price_snapshot
        FROM order_items oi
        WHERE oi.order_id = o.order_id
        ORDER BY oi.order_item_id
        LIMIT 1
      ) AS ticket_price,
      (
        SELECT COALESCE(SUM(oi.qty), 0)
        FROM order_items oi
        WHERE oi.order_id = o.order_id
      ) AS ticket_quantity,
      (
        SELECT oi.verification_status
        FROM order_items oi
        WHERE oi.order_id = o.order_id
        ORDER BY oi.order_item_id
        LIMIT 1
      ) AS verification_status,
      (
        SELECT p.method
        FROM payments p
        WHERE p.order_id = o.order_id
          AND p.payment_status = 'success'
        ORDER BY p.paid_at DESC, p.payment_id DESC
        LIMIT 1
      ) AS payment_method,
      (
        SELECT p.payment_status
        FROM payments p
        WHERE p.order_id = o.order_id
        ORDER BY p.paid_at DESC, p.payment_id DESC
        LIMIT 1
      ) AS payment_status,
      (
        SELECT t.ticket_no
        FROM tickets t
        WHERE t.order_id = o.order_id
        ORDER BY t.created_at DESC, t.ticket_id DESC
        LIMIT 1
      ) AS qr_code
    FROM orders o
    LEFT JOIN users u ON u.user_id = o.user_id
    ${whereSql}
    ORDER BY o.created_at DESC
    LIMIT ${safePageSize} OFFSET ${offset}`,
    params
  );

  return {
    items: rows.map(mapOrderListItem),
    pageInfo: {
      page: safePage,
      pageSize: safePageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / safePageSize)
    }
  };
}

export async function listTickets(
  filters: TicketListFilters,
  page: number,
  pageSize: number
): Promise<PaginatedTicketList> {
  await ensureCommerceTables();

  const safePage = Math.max(1, page);
  const safePageSize = Math.min(100, Math.max(1, pageSize));
  const offset = (safePage - 1) * safePageSize;
  const params: Record<string, number | string> = {};
  const whereSql = buildTicketWhere(filters, params);
  const pool = getMysqlPool();
  const [countRows] = await pool.execute<CountRow[]>(
    `SELECT COUNT(*) AS total
    FROM tickets t
    JOIN orders o ON o.order_id = t.order_id
    ${whereSql}`,
    params
  );
  const totalItems = Number(countRows[0]?.total ?? 0);
  const [rows] = await pool.execute<TicketListRow[]>(
    `SELECT
      t.ticket_id,
      t.ticket_no,
      t.ticket_status,
      t.valid_from,
      t.valid_to,
      t.created_at AS issued_at,
      o.order_id,
      o.order_no,
      o.visit_date,
      o.entry_time_start,
      o.entry_time_end,
      o.paid_at,
      oi.ticket_name_snapshot AS ticket_name
    FROM tickets t
    JOIN orders o ON o.order_id = t.order_id
    JOIN order_items oi ON oi.order_item_id = t.order_item_id
    ${whereSql}
    ORDER BY t.created_at DESC, t.ticket_id DESC
    LIMIT ${safePageSize} OFFSET ${offset}`,
    params
  );

  return {
    items: rows.map(mapTicketListItem),
    pageInfo: {
      page: safePage,
      pageSize: safePageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / safePageSize)
    }
  };
}

export async function markOrderPaid(
  orderId: string,
  method: PaymentMethod
): Promise<{ order: OrderDetail; paymentId: string }> {
  await ensureCommerceTables();

  const pool = getMysqlPool();
  const connection = await pool.getConnection();
  let paymentId = "";

  try {
    await connection.beginTransaction();
    const [orderRows] = await connection.execute<OrderRow[]>(
      `SELECT
        order_id,
        park_id,
        user_id,
        order_no,
        order_source,
        order_status,
        visit_date,
        entry_time_start,
        entry_time_end,
        total_amount,
        currency,
        created_at,
        paid_at
      FROM orders
      WHERE order_id = :orderId
      FOR UPDATE`,
      { orderId }
    );
    const order = orderRows[0];

    if (!order) {
      throw new Error("ORDER_NOT_FOUND");
    }

    if (order.order_status === "paid") {
      const [existingPayments] = await connection.execute<PaymentRow[]>(
        `SELECT payment_id, method, payment_status, amount, paid_at
        FROM payments
        WHERE order_id = :orderId
          AND payment_status = 'success'
        ORDER BY paid_at DESC, payment_id DESC
        LIMIT 1`,
        { orderId }
      );
      paymentId = existingPayments[0]?.payment_id ?? "";
      await connection.commit();
    } else {
      const paidAt = new Date();
      paymentId = randomUUID();
      await connection.execute(
        `INSERT INTO payments (
          payment_id,
          order_id,
          park_id,
          method,
          provider_txn_id,
          payment_status,
          amount,
          paid_at,
          raw_payload_json
        ) VALUES (
          :paymentId,
          :orderId,
          :parkId,
          :method,
          :providerTxnId,
          'success',
          :amount,
          :paidAt,
          :rawPayloadJson
        )`,
        {
          amount: order.total_amount,
          method,
          orderId,
          paidAt,
          parkId: order.park_id,
          paymentId,
          providerTxnId: `dev-${paymentId}`,
          rawPayloadJson: JSON.stringify({
            mode: "dev-success-default",
            note: "Payment provider integration is intentionally stubbed."
          })
        }
      );
      await connection.execute(
        `UPDATE orders
        SET order_status = 'paid',
          paid_at = :paidAt
        WHERE order_id = :orderId`,
        { orderId, paidAt }
      );
      await issueTickets(connection, order);
      await connection.commit();
    }
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  const paidOrder = await findOrderById(orderId);

  if (!paidOrder) {
    throw new Error("ORDER_NOT_FOUND");
  }

  return {
    order: paidOrder,
    paymentId:
      paymentId ||
      paidOrder.payments.find((payment) => payment.status === "success")
        ?.paymentId ||
      ""
  };
}

async function issueTickets(connection: PoolConnection, order: OrderRow) {
  const [existingTickets] = await connection.execute<TicketRow[]>(
    `SELECT ticket_id, ticket_no, ticket_status, valid_from, valid_to
    FROM tickets
    WHERE order_id = :orderId
    LIMIT 1`,
    { orderId: order.order_id }
  );

  if (existingTickets.length > 0) {
    return;
  }

  const [items] = await connection.execute<OrderItemRow[]>(
    `SELECT
      order_item_id,
      ticket_type_id,
      ticket_name_snapshot,
      unit_price_snapshot,
      qty,
      requires_verification,
      verification_status
    FROM order_items
    WHERE order_id = :orderId`,
    { orderId: order.order_id }
  );
  const createdAt = new Date();
  const validFrom = `${toDateString(order.visit_date)} ${order.entry_time_start}`;
  const validTo = `${toDateString(order.visit_date)} ${order.entry_time_end}`;

  for (const item of items) {
    for (let index = 0; index < Number(item.qty); index += 1) {
      await connection.execute(
        `INSERT INTO tickets (
          ticket_id,
          park_id,
          order_id,
          order_item_id,
          user_id,
          ticket_no,
          ticket_status,
          valid_from,
          valid_to,
          created_at
        ) VALUES (
          :ticketId,
          :parkId,
          :orderId,
          :orderItemId,
          :userId,
          :ticketNo,
          'unused',
          :validFrom,
          :validTo,
          :createdAt
        )`,
        {
          createdAt,
          orderId: order.order_id,
          orderItemId: item.order_item_id,
          parkId: order.park_id,
          ticketId: randomUUID(),
          ticketNo: createTicketNo(),
          userId: order.user_id,
          validFrom,
          validTo
        }
      );
    }
  }
}

export function ensureCommerceTables() {
  schemaPromise ??= createCommerceTables();
  return schemaPromise;
}

async function createCommerceTables() {
  const pool = getMysqlPool();

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
  await pool.query(`CREATE TABLE IF NOT EXISTS orders (
    order_id varchar(36) NOT NULL PRIMARY KEY,
    park_id varchar(64) NOT NULL,
    user_id varchar(64) NULL,
    order_no varchar(32) NOT NULL UNIQUE,
    order_source varchar(20) NOT NULL,
    order_status varchar(30) NOT NULL,
    visit_date date NOT NULL,
    entry_time_start time NOT NULL,
    entry_time_end time NOT NULL,
    total_amount decimal(12,2) NOT NULL,
    currency varchar(8) NOT NULL,
    created_at datetime(3) NOT NULL,
    paid_at datetime(3) NULL,
    canceled_at datetime(3) NULL,
    INDEX idx_orders_park_created (park_id, created_at),
    INDEX idx_orders_user_created (user_id, created_at),
    INDEX idx_orders_status_created (order_status, created_at)
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS order_items (
    order_item_id varchar(36) NOT NULL PRIMARY KEY,
    order_id varchar(36) NOT NULL,
    ticket_type_id varchar(64) NOT NULL,
    ticket_name_snapshot varchar(255) NOT NULL,
    unit_price_snapshot decimal(12,2) NOT NULL,
    qty int NOT NULL,
    requires_verification tinyint(1) NOT NULL DEFAULT 0,
    verification_status varchar(30) NOT NULL,
    INDEX idx_order_items_order (order_id)
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS payments (
    payment_id varchar(36) NOT NULL PRIMARY KEY,
    order_id varchar(36) NOT NULL,
    park_id varchar(64) NOT NULL,
    method varchar(30) NOT NULL,
    provider_txn_id varchar(128) NULL,
    payment_status varchar(30) NOT NULL,
    amount decimal(12,2) NOT NULL,
    paid_at datetime(3) NULL,
    raw_payload_json json NULL,
    INDEX idx_payments_order (order_id),
    INDEX idx_payments_park_status (park_id, payment_status)
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS tickets (
    ticket_id varchar(36) NOT NULL PRIMARY KEY,
    park_id varchar(64) NOT NULL,
    order_id varchar(36) NOT NULL,
    order_item_id varchar(36) NOT NULL,
    user_id varchar(64) NULL,
    ticket_no varchar(32) NOT NULL UNIQUE,
    ticket_status varchar(30) NOT NULL,
    valid_from datetime(3) NOT NULL,
    valid_to datetime(3) NOT NULL,
    used_at datetime(3) NULL,
    created_at datetime(3) NOT NULL,
    INDEX idx_tickets_order (order_id),
    INDEX idx_tickets_user_status (user_id, ticket_status),
    INDEX idx_tickets_park_status (park_id, ticket_status)
  )`);
}

function buildOrderWhere(
  filters: OrderListFilters,
  params: Record<string, number | string>
) {
  const clauses = ["1 = 1"];

  if (filters.userId) {
    clauses.push("o.user_id = :userId");
    params.userId = filters.userId;
  }

  if (filters.parkId) {
    clauses.push("o.park_id = :parkId");
    params.parkId = filters.parkId;
  }

  if (filters.status) {
    clauses.push("o.order_status = :status");
    params.status = filters.status;
  }

  if (filters.orderNo) {
    clauses.push("o.order_no LIKE :orderNo");
    params.orderNo = `%${filters.orderNo}%`;
  }

  if (filters.userKeyword) {
    clauses.push("(o.user_id LIKE :userKeyword OR o.order_no LIKE :userKeyword)");
    params.userKeyword = `%${filters.userKeyword}%`;
  }

  if (filters.visitDate) {
    clauses.push("o.visit_date = :visitDate");
    params.visitDate = filters.visitDate;
  }

  if (filters.createdFrom) {
    clauses.push("o.created_at >= :createdFrom");
    params.createdFrom = filters.createdFrom;
  }

  if (filters.createdTo) {
    clauses.push("o.created_at <= :createdTo");
    params.createdTo = filters.createdTo;
  }

  if (filters.paymentMethod) {
    clauses.push(`EXISTS (
      SELECT 1
      FROM payments p_filter
      WHERE p_filter.order_id = o.order_id
        AND p_filter.method = :paymentMethod
        AND p_filter.payment_status = 'success'
    )`);
    params.paymentMethod = filters.paymentMethod;
  }

  return `WHERE ${clauses.join(" AND ")}`;
}

function buildTicketWhere(
  filters: TicketListFilters,
  params: Record<string, number | string>
) {
  const clauses = ["1 = 1"];

  if (filters.userId) {
    clauses.push("t.user_id = :userId");
    params.userId = filters.userId;
  }

  return `WHERE ${clauses.join(" AND ")}`;
}

function mapOrderDetail(
  order: OrderRow,
  itemRows: OrderItemRow[],
  paymentRows: PaymentRow[],
  ticketRows: TicketRow[]
): OrderDetail {
  return {
    createdAt: toIsoString(order.created_at),
    currency: order.currency,
    items: itemRows.map(mapOrderItem),
    orderId: order.order_id,
    orderNo: order.order_no,
    orderSource: order.order_source,
    orderStatus: order.order_status,
    paidAt: toNullableIsoString(order.paid_at),
    parkId: order.park_id,
    payments: paymentRows.map((payment) => mapPayment(payment, order.currency)),
    tickets: ticketRows.map(mapTicket),
    timeLabel: `${toTimeLabel(order.entry_time_start)} - ${toTimeLabel(
      order.entry_time_end
    )}`,
    totalAmount: toNumber(order.total_amount),
    userId: order.user_id,
    visitDate: toDateString(order.visit_date)
  };
}

function mapOrderItem(row: OrderItemRow): OrderItemSummary {
  return {
    orderItemId: row.order_item_id,
    quantity: Number(row.qty),
    requiresVerification: Boolean(row.requires_verification),
    ticketName: row.ticket_name_snapshot,
    ticketTypeId: row.ticket_type_id,
    unitPrice: toNumber(row.unit_price_snapshot),
    verificationStatus: row.verification_status
  };
}

function mapPayment(row: PaymentRow, currency: string): PaymentSummary {
  return {
    amount: toNumber(row.amount),
    currency,
    method: row.method,
    paidAt: toNullableIsoString(row.paid_at),
    paymentId: row.payment_id,
    status: row.payment_status
  };
}

function mapTicket(row: TicketRow): TicketSummary {
  return {
    status: resolveTicketStatus(row.ticket_status, row.valid_to),
    ticketId: row.ticket_id,
    ticketNo: row.ticket_no,
    validFrom: toIsoString(row.valid_from),
    validTo: toIsoString(row.valid_to)
  };
}

function mapTicketListItem(row: TicketListRow): TicketListItem {
  return {
    issuedAt: toIsoString(row.issued_at),
    orderId: row.order_id,
    orderNo: row.order_no,
    paidAt: toNullableIsoString(row.paid_at),
    status: resolveTicketStatus(row.ticket_status, row.valid_to),
    ticketId: row.ticket_id,
    ticketName: row.ticket_name,
    ticketNo: row.ticket_no,
    timeLabel: `${toTimeLabel(row.entry_time_start)} - ${toTimeLabel(
      row.entry_time_end
    )}`,
    validFrom: toIsoString(row.valid_from),
    validTo: toIsoString(row.valid_to),
    visitDate: toDateString(row.visit_date)
  };
}

function mapOrderListItem(row: OrderListRow): OrderListItem {
  const createdAt = toIsoString(row.created_at);
  const visitDate = toDateString(row.visit_date);
  const timeLabel = `${toTimeLabel(row.entry_time_start)} - ${toTimeLabel(
    row.entry_time_end
  )}`;

  return {
    admissionDate: visitDate,
    admissionTime: timeLabel,
    createdAt,
    currency: row.currency,
    orderId: row.order_id,
    orderNo: row.order_no,
    orderStatus: row.order_status,
    paidAt: toNullableIsoString(row.paid_at),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    purchaseDate: createdAt,
    qrCode: row.qr_code,
    ticketPrice: toNumber(row.ticket_price ?? 0),
    ticketTypeId: row.ticket_type_id,
    ticketName: row.ticket_name ?? "-",
    ticketQuantity: Number(row.ticket_quantity ?? 0),
    timeLabel,
    totalAmount: toNumber(row.total_amount),
    userName: row.user_name,
    verificationStatus: row.verification_status,
    visitDate
  };
}

function createOrderNo() {
  return `ORD-${Date.now().toString().slice(-8)}-${randomUUID()
    .slice(0, 4)
    .toUpperCase()}`;
}

function createTicketNo() {
  return `TKT-${Date.now().toString().slice(-8)}-${randomUUID()
    .slice(0, 4)
    .toUpperCase()}`;
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

function toNullableIsoString(value: Date | string | null) {
  return value ? toIsoString(value) : null;
}

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

function toTimeLabel(value: string) {
  return value.slice(0, 5);
}

function resolveTicketStatus(
  status: TicketStatus,
  validTo: Date | string
): TicketStatus {
  if (status === "unused" && new Date(toIsoString(validTo)).getTime() < Date.now()) {
    return "expired";
  }

  return status;
}
