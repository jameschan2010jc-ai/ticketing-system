import type {
  CreateOrderPaymentRequest,
  CreateOrderPaymentResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  GuestPurchaseNoticeResponse,
  HealthResponse,
  HomeContentResponse,
  MyOrdersResponse,
  MyTicketsResponse,
  OrderDetailResponse,
  PaymentMethodListResponse,
  PaymentSuccessSummaryResponse,
  LoginExistingAccountRequest,
  LoginExistingAccountResponse,
  PurchaseContentConfirmRequest,
  PurchaseContentConfirmResponse,
  PurchaseContentOptionsResponse,
  PurchaseMethodOptionsResponse,
  RegisterUserRequest,
  RegisterUserResponse
} from "@packages/shared-types";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001"
).replace(/\/$/, "");

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  const userId = window.localStorage.getItem("ticketingUserId");

  if (userId) {
    headers.set("X-Demo-User-Id", userId);
  }

  const response = await fetch(`${API_BASE_URL}/api/v1${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    throw new Error(errorBody?.message ?? `API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getApiHealth() {
  return apiRequest<HealthResponse>("/health");
}

export async function getHomeContent() {
  return apiRequest<HomeContentResponse>("/home-content");
}

export async function getPurchaseMethodOptions() {
  return apiRequest<PurchaseMethodOptionsResponse>("/purchase-method/options");
}

export async function getGuestPurchaseNotice() {
  return apiRequest<GuestPurchaseNoticeResponse>(
    "/purchase-method/guest-notice"
  );
}

export async function getPurchaseContentOptions() {
  return apiRequest<PurchaseContentOptionsResponse>("/purchase-content/options");
}

export async function confirmPurchaseContent(
  request: PurchaseContentConfirmRequest
) {
  return apiRequest<PurchaseContentConfirmResponse>(
    "/purchase-content/confirm",
    {
      body: JSON.stringify(request),
      method: "POST"
    }
  );
}

export async function createOrder(request: CreateOrderRequest) {
  return apiRequest<CreateOrderResponse>("/orders", {
    body: JSON.stringify(request),
    method: "POST"
  });
}

export async function getOrder(orderId: string) {
  return apiRequest<OrderDetailResponse>(`/orders/${orderId}`);
}

export async function getMyOrders(page = 1, pageSize = 20) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize)
  });

  return apiRequest<MyOrdersResponse>(`/orders/my?${params.toString()}`);
}

export async function getMyTickets(page = 1, pageSize = 20) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize)
  });

  return apiRequest<MyTicketsResponse>(`/tickets/my?${params.toString()}`);
}

export async function getPaymentMethods() {
  return apiRequest<PaymentMethodListResponse>("/payment/methods");
}

export async function payOrder(
  orderId: string,
  request: CreateOrderPaymentRequest
) {
  return apiRequest<CreateOrderPaymentResponse>(`/orders/${orderId}/payments`, {
    body: JSON.stringify(request),
    method: "POST"
  });
}

export async function getPaymentSuccessSummary(orderId: string) {
  const params = new URLSearchParams({ orderId });

  return apiRequest<PaymentSuccessSummaryResponse>(
    `/payment/success-summary?${params.toString()}`
  );
}

export async function registerUser(request: RegisterUserRequest) {
  const path =
    request.accountType === "phone"
      ? "/auth/register/phone/complete"
      : "/auth/register/email/complete";

  return apiRequest<RegisterUserResponse>(path, {
    body: JSON.stringify(request),
    method: "POST"
  });
}

export async function loginExistingAccount(request: LoginExistingAccountRequest) {
  return apiRequest<LoginExistingAccountResponse>(
    "/auth/login-existing-account",
    {
      body: JSON.stringify(request),
      method: "POST"
    }
  );
}
