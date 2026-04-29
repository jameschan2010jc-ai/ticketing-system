import type {
  PurchaseContentConfirmRequest,
  PurchaseContentConfirmResponse,
  PurchaseContentOptionsResponse
} from "@packages/shared-types";

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

export function getPurchaseContentOptions(): PurchaseContentOptionsResponse {
  return purchaseOptions;
}

export function confirmPurchaseContent(
  request: PurchaseContentConfirmRequest
): PurchaseContentConfirmResponse {
  const selectedTicket = purchaseOptions.ticketTypes.find(
    (ticketType) => ticketType.ticketTypeId === request.ticketTypeId
  );

  if (!selectedTicket) {
    throw new Error("TICKET_NOT_AVAILABLE");
  }

  if (request.quantity !== 1) {
    throw new Error("INVALID_QUANTITY");
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
