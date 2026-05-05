import type {
  AdminParkConfig,
  AdminTicketType,
  PurchaseContentConfirmRequest,
  PurchaseContentConfirmResponse,
  PurchaseContentOptionsResponse
} from "@packages/shared-types";
import {
  getParkConfig,
  listTicketTypes
} from "../repositories/admin-config.repository";

const purchaseOptions: PurchaseContentOptionsResponse = {
  visitDates: [
    { date: "2026-05-01", isAvailable: true },
    { date: "2026-05-02", isAvailable: true },
    { date: "2026-05-03", isAvailable: false }
  ],
  timeSlots: [
    { timeSlotId: "morning", label: "09:00 - 12:00", isAvailable: true },
    { timeSlotId: "afternoon", label: "13:00 - 17:00", isAvailable: true }
  ],
  ticketTypes: [
    {
      ticketTypeId: "adult",
      name: "Adult Ticket",
      description: "Standard admission ticket.",
      price: 180,
      currency: "TWD",
      requiresIdVerification: false,
      remainingQuantity: 120
    },
    {
      ticketTypeId: "discount",
      name: "Discount Ticket",
      description: "Verification-required ticket type.",
      price: 120,
      currency: "TWD",
      requiresIdVerification: true,
      remainingQuantity: 40
    }
  ],
  rules: {
    maxTicketsPerOrder: 1
  }
};

export async function getPurchaseContentOptions(
  parkId = "demo-park"
): Promise<PurchaseContentOptionsResponse> {
  const park = await getParkConfig(parkId);
  const ticketTypes = await listTicketTypes(parkId);

  if (!park) {
    return purchaseOptions;
  }

  const today = getTodayDateString(park.timezone);
  const purchasableTickets = ticketTypes.filter((ticket) =>
    isTicketOnSale(ticket, today)
  );
  const visitDates = buildVisitDates(park, purchasableTickets, today);

  return {
    rules: {
      maxTicketsPerOrder: park.maxTicketsPerOrder
    },
    ticketTypes: purchasableTickets.map((ticket) => ({
      currency: ticket.currency,
      description: ticket.description,
      name: ticket.name,
      price: ticket.price,
      remainingQuantity: ticket.remainingQuantity,
      requiresIdVerification: ticket.requiresIdVerification,
      ticketTypeId: ticket.ticketTypeId
    })),
    timeSlots: purchaseOptions.timeSlots,
    visitDates
  };
}

export async function confirmPurchaseContent(
  request: PurchaseContentConfirmRequest,
  parkId = "demo-park"
): Promise<PurchaseContentConfirmResponse> {
  const options = await getPurchaseContentOptions(parkId);
  const selectedTicket = options.ticketTypes.find(
    (ticketType) => ticketType.ticketTypeId === request.ticketTypeId
  );
  const selectedDate = options.visitDates.find(
    (visitDate) => visitDate.date === request.visitDate
  );
  const selectedTimeSlot = options.timeSlots.find(
    (timeSlot) => timeSlot.timeSlotId === request.timeSlotId
  );

  if (!selectedTicket) {
    throw new Error("TICKET_NOT_AVAILABLE");
  }

  if (request.quantity !== 1) {
    throw new Error("INVALID_QUANTITY");
  }

  if (!selectedDate?.isAvailable || !selectedTimeSlot?.isAvailable) {
    throw new Error("VISIT_SLOT_NOT_AVAILABLE");
  }

  const requiresIdVerification = selectedTicket.requiresIdVerification;

  return {
    purchaseContextId: `ctx-${Date.now()}`,
    requiresIdVerification,
    nextStep: requiresIdVerification
      ? "verification_required_order"
      : "order_confirmation",
    nextPage: requiresIdVerification ? "p50" : "p11",
    nextRoute: requiresIdVerification
      ? "/verification-required-order"
      : "/order-confirmation",
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  };
}

function addDays(date: string, days: number) {
  const next = new Date(`${date}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

function buildVisitDates(
  park: AdminParkConfig,
  tickets: AdminTicketType[],
  today: string
) {
  const bookingWindowDays = Math.max(1, park.bookingWindowDays);
  const startDate = maxDate(park.openDateStart, today);
  const endDate = minDate(
    park.openDateEnd,
    addDays(startDate, bookingWindowDays - 1)
  );
  const visitDates: PurchaseContentOptionsResponse["visitDates"] = [];

  if (endDate < startDate) {
    return visitDates;
  }

  for (
    let date = startDate;
    date <= endDate;
    date = addDays(date, 1)
  ) {
    visitDates.push({
      date,
      isAvailable:
        park.status === "active" &&
        tickets.some((ticket) => isTicketValidForVisitDate(ticket, date))
    });
  }

  return visitDates;
}

function isTicketOnSale(ticket: AdminTicketType, today: string) {
  return (
    ticket.isActive &&
    ticket.remainingQuantity > 0 &&
    isDateInRange(today, ticket.saleStartDate, ticket.saleEndDate)
  );
}

function isTicketValidForVisitDate(ticket: AdminTicketType, visitDate: string) {
  return isDateInRange(visitDate, ticket.visitStartDate, ticket.visitEndDate);
}

function isDateInRange(date: string, startDate: string, endDate: string) {
  return date >= startDate && date <= endDate;
}

function maxDate(first: string, second: string) {
  return first >= second ? first : second;
}

function minDate(first: string, second: string) {
  return first <= second ? first : second;
}

function getTodayDateString(timeZone: string) {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      day: "2-digit",
      month: "2-digit",
      timeZone,
      year: "numeric"
    }).formatToParts(new Date());
    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    if (year && month && day) {
      return `${year}-${month}-${day}`;
    }
  } catch {
    // Fall through to UTC if the configured timezone is invalid.
  }

  return new Date().toISOString().slice(0, 10);
}
