export interface HealthResponse {
  status: "ok";
  service: "ticketing-api";
  version: "v1";
  timestamp: string;
}

export interface PageFlowStep {
  pageId: string;
  action: string;
  nextPageId?: string;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  traceId?: string;
}

export interface HomeContentResponse {
  park: {
    parkId: string;
    name: string;
    intro: string;
    heroImageUrl: string;
    openDateRange: string;
  };
  ticketSummary: {
    startingPrice: number;
    currency: string;
    maxTicketsPerOrder: 1;
  };
  primaryAction: {
    label: string;
    targetPage: "p2";
    targetRoute: "/purchase-method";
  };
}

export interface PurchaseMethodOptionsResponse {
  title: string;
  options: Array<{
    id: "existing-account" | "new-account" | "guest";
    label: string;
    description: string;
    targetPage: "p30" | "p40" | "p3";
    targetRoute:
      | "/login-existing-account"
      | "/register-method"
      | "/purchase-method/guest-notice";
  }>;
}

export interface GuestPurchaseNoticeResponse {
  title: string;
  paragraphs: string[];
  acknowledgementLabel: string;
  continueTargetPage: "p10";
  continueTargetRoute: "/purchase-content";
}

export interface PurchaseContentOptionsResponse {
  visitDates: Array<{
    date: string;
    isAvailable: boolean;
  }>;
  timeSlots: Array<{
    timeSlotId: string;
    label: string;
    isAvailable: boolean;
  }>;
  ticketTypes: Array<{
    ticketTypeId: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    requiresIdVerification: boolean;
    remainingQuantity: number;
  }>;
  rules: {
    maxTicketsPerOrder: 1;
  };
}

export interface PurchaseContentConfirmRequest {
  visitDate: string;
  timeSlotId: string;
  ticketTypeId: string;
  quantity: 1;
  purchaseMode: "guest" | "registered";
}

export interface PurchaseContentConfirmResponse {
  purchaseContextId: string;
  requiresIdVerification: boolean;
  nextStep: "verification_required_order" | "order_confirmation";
  nextPage: "p50" | "p11";
  nextRoute: "/verification-required-order" | "/order-confirmation";
  expiresAt: string;
}
