import type {
  CreateOrderRequest,
  OrderStatus,
  PaymentMethod
} from "@packages/shared-types";
import {
  createOrder,
  findOrderById,
  listTickets,
  listOrders,
  type OrderListFilters
} from "../repositories/order.repository";
import { getPurchaseContentOptions } from "./purchase-content.service";

export class OrderServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

export interface RequestContext {
  parkId: string;
  userId: string;
}

export interface OrderQuery {
  createdFrom?: string;
  createdTo?: string;
  orderNo?: string;
  paymentMethod?: PaymentMethod;
  status?: OrderStatus;
  userKeyword?: string;
  visitDate?: string;
}

export async function createPendingOrder(
  request: CreateOrderRequest,
  context: RequestContext
 ) {
  if (request.quantity !== 1) {
    throw new OrderServiceError(
      "INVALID_QUANTITY",
      "Max 1 ticket per order is allowed.",
      400
    );
  }

  const options = await getPurchaseContentOptions(context.parkId);
  const ticketType = options.ticketTypes.find(
    (ticket) => ticket.ticketTypeId === request.ticketTypeId
  );
  const timeSlot = options.timeSlots.find(
    (slot) => slot.timeSlotId === request.timeSlotId
  );
  const visitDate = options.visitDates.find(
    (date) => date.date === request.visitDate
  );

  if (!ticketType || ticketType.remainingQuantity < request.quantity) {
    throw new OrderServiceError(
      "TICKET_NOT_AVAILABLE",
      "Selected ticket is no longer available.",
      409
    );
  }

  if (!timeSlot?.isAvailable || !visitDate?.isAvailable) {
    throw new OrderServiceError(
      "VISIT_SLOT_NOT_AVAILABLE",
      "Selected visit date or entry time is not available.",
      409
    );
  }

  const [entryTimeStart, entryTimeEnd] = parseTimeSlotLabel(timeSlot.label);

  return createOrder({
    currency: ticketType.currency,
    entryTimeEnd,
    entryTimeStart,
    orderSource: request.purchaseMode,
    parkId: context.parkId,
    quantity: request.quantity,
    requiresVerification: ticketType.requiresIdVerification,
    ticketName: ticketType.name,
    ticketTypeId: ticketType.ticketTypeId,
    unitPrice: ticketType.price,
    userId: request.purchaseMode === "registered" ? context.userId : null,
    verificationStatus: ticketType.requiresIdVerification ? "passed" : "not_required",
    visitDate: request.visitDate
  });
}

export async function getOrder(orderId: string) {
  const order = await findOrderById(orderId);

  if (!order) {
    throw new OrderServiceError("ORDER_NOT_FOUND", "Order not found.", 404);
  }

  return order;
}

export function getMyOrders(
  userId: string,
  page: number,
  pageSize: number
) {
  return listOrders({ userId }, page, pageSize);
}

export function getMyTickets(
  userId: string,
  page: number,
  pageSize: number
) {
  return listTickets({ userId }, page, pageSize);
}

export function getAdminOrders(
  parkId: string,
  query: OrderQuery,
  page: number,
  pageSize: number
) {
  const filters: OrderListFilters = {
    createdFrom: query.createdFrom,
    createdTo: query.createdTo,
    orderNo: query.orderNo,
    parkId,
    paymentMethod: query.paymentMethod,
    status: query.status,
    userKeyword: query.userKeyword,
    visitDate: query.visitDate
  };

  return listOrders(filters, page, pageSize);
}

function parseTimeSlotLabel(label: string): [string, string] {
  const [rawStart, rawEnd] = label.split("-").map((part) => part.trim());

  if (!rawStart || !rawEnd) {
    throw new OrderServiceError(
      "INVALID_TIME_SLOT",
      "Selected entry time is invalid.",
      400
    );
  }

  return [normalizeTime(rawStart), normalizeTime(rawEnd)];
}

function normalizeTime(value: string) {
  return value.length === 5 ? `${value}:00` : value;
}
