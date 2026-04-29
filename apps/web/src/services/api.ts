import type {
  GuestPurchaseNoticeResponse,
  HealthResponse,
  HomeContentResponse,
  PurchaseContentConfirmRequest,
  PurchaseContentConfirmResponse,
  PurchaseContentOptionsResponse,
  PurchaseMethodOptionsResponse
} from "@packages/shared-types";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001"
).replace(/\/$/, "");

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
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
