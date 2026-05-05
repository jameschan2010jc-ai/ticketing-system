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

export type OrderSource = "guest" | "registered";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "failed"
  | "canceled"
  | "refunded";

export type PaymentMethod = "credit-card" | "line-pay";

export type PaymentStatus =
  | "initiated"
  | "success"
  | "failed"
  | "timeout"
  | "refund";

export type TicketStatus = "unused" | "used" | "expired" | "canceled";

export interface PageInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface OrderItemSummary {
  orderItemId: string;
  ticketTypeId: string;
  ticketName: string;
  unitPrice: number;
  quantity: number;
  requiresVerification: boolean;
  verificationStatus: "not_required" | "pending" | "passed" | "failed";
}

export interface PaymentSummary {
  paymentId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paidAt: string | null;
}

export interface TicketSummary {
  ticketId: string;
  ticketNo: string;
  status: TicketStatus;
  validFrom: string;
  validTo: string;
}

export interface OrderDetail {
  orderId: string;
  parkId: string;
  userId: string | null;
  orderNo: string;
  orderSource: OrderSource;
  orderStatus: OrderStatus;
  visitDate: string;
  timeLabel: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  paidAt: string | null;
  items: OrderItemSummary[];
  payments: PaymentSummary[];
  tickets: TicketSummary[];
}

export interface OrderListItem {
  orderId: string;
  orderNo: string;
  orderStatus: OrderStatus;
  userName: string | null;
  paymentStatus: PaymentStatus | null;
  visitDate: string;
  timeLabel: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  paidAt: string | null;
  purchaseDate: string;
  admissionDate: string;
  admissionTime: string;
  ticketTypeId: string | null;
  ticketName: string;
  ticketPrice: number;
  ticketQuantity: number;
  verificationStatus: OrderItemSummary["verificationStatus"] | null;
  paymentMethod: PaymentMethod | null;
  qrCode: string | null;
}

export interface CreateOrderRequest {
  purchaseContextId?: string;
  purchaseMode: OrderSource;
  visitDate: string;
  timeSlotId: string;
  ticketTypeId: string;
  quantity: 1;
}

export interface CreateOrderResponse {
  success: true;
  data: OrderDetail;
}

export interface OrderDetailResponse {
  data: OrderDetail;
}

export interface OrderListResponse {
  items: OrderListItem[];
  pageInfo: PageInfo;
}

export type MyOrdersResponse = OrderListResponse;

export interface TicketListItem {
  ticketId: string;
  ticketNo: string;
  status: TicketStatus;
  orderId: string;
  orderNo: string;
  ticketName: string;
  visitDate: string;
  timeLabel: string;
  validFrom: string;
  validTo: string;
  issuedAt: string;
  paidAt: string | null;
}

export interface TicketListResponse {
  items: TicketListItem[];
  pageInfo: PageInfo;
}

export type MyTicketsResponse = TicketListResponse;

export interface PaymentMethodListResponse {
  methods: Array<{
    method: PaymentMethod;
    label: string;
    isEnabled: boolean;
  }>;
}

export interface CreateOrderPaymentRequest {
  method: PaymentMethod;
}

export interface CreateOrderPaymentResponse {
  success: true;
  data: {
    orderId: string;
    paymentId: string;
    status: "success";
    nextPage: "p13";
    nextRoute: "/payment-success";
    order: OrderDetail;
  };
}

export interface PaymentSuccessSummaryResponse {
  data: OrderDetail;
}

export interface AdminParkConfig {
  parkId: string;
  name: string;
  intro: string;
  heroImageUrl: string;
  openDateStart: string;
  openDateEnd: string;
  timezone: string;
  currency: string;
  bookingWindowDays: number;
  maxTicketsPerOrder: 1;
  enableCreditCard: boolean;
  enableLinePay: boolean;
  status: "active" | "inactive";
  updatedAt: string;
}

export type UpdateParkConfigRequest = Omit<
  AdminParkConfig,
  "parkId" | "updatedAt"
>;

export type CreateParkConfigRequest = Pick<AdminParkConfig, "parkId"> &
  UpdateParkConfigRequest;

export interface AdminStatusRequest {
  status: "active" | "inactive";
}

export interface DeleteResponse {
  success: true;
}

export interface AdminParkConfigResponse {
  data: AdminParkConfig;
}

export interface AdminParkListResponse {
  items: Array<{
    parkId: string;
    name: string;
    status: "active" | "inactive";
  }>;
}

export interface AdminTicketType {
  ticketTypeId: string;
  parkId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  requiresIdVerification: boolean;
  isActive: boolean;
  saleStartDate: string;
  saleEndDate: string;
  visitStartDate: string;
  visitEndDate: string;
  dailyCapQuantity: number;
  periodCapQuantity: number;
  remainingQuantity: number;
  updatedAt: string;
}

export type UpdateTicketTypeRequest = Omit<
  AdminTicketType,
  "ticketTypeId" | "parkId" | "updatedAt"
>;

export type CreateTicketTypeRequest = Pick<AdminTicketType, "ticketTypeId"> &
  UpdateTicketTypeRequest;

export interface AdminTicketCatalogResponse {
  items: AdminTicketType[];
}

export interface AdminTicketTypeResponse {
  data: AdminTicketType;
}

export type UserStatus = "active" | "locked" | "deactivated";

export interface UserListItem {
  userId: string;
  accountType: "phone" | "email";
  account: string;
  displayName: string;
  status: UserStatus;
  orderCount: number;
  totalAmountSpent: number;
  totalTicketCount: number;
  unusedTicketCount: number;
  createdAt: string;
  lastPasswordChangedAt: string | null;
}

export interface AdminUsersResponse {
  items: UserListItem[];
  pageInfo: PageInfo;
}

export interface RegisterUserRequest {
  accountType: "phone" | "email";
  account: string;
  password: string;
  verificationCode: string;
}

export interface RegisterUserResponse {
  success: true;
  data: UserListItem;
}

export interface LoginExistingAccountRequest {
  account: string;
  password: string;
}

export interface LoginExistingAccountResponse {
  success: true;
  data: UserListItem;
}
