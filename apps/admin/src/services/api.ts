import type {
  AdminParkConfigResponse,
  AdminParkListResponse,
  AdminStatusRequest,
  AdminTicketCatalogResponse,
  AdminTicketTypeResponse,
  AdminUsersResponse,
  CreateParkConfigRequest,
  CreateTicketTypeRequest,
  DeleteResponse,
  OrderListResponse,
  UpdateParkConfigRequest,
  UpdateTicketTypeRequest
} from "@packages/shared-types";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001"
).replace(/\/$/, "");

async function apiRequest<T>(
  path: string,
  parkId: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Park-Id": parkId,
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

export function getAdminParks(parkId: string) {
  return apiRequest<AdminParkListResponse>("/admin/parks", parkId);
}

export function getAdminParkConfig(parkId: string) {
  return apiRequest<AdminParkConfigResponse>("/admin/park/profile", parkId);
}

export function createAdminPark(
  parkId: string,
  request: CreateParkConfigRequest
) {
  return apiRequest<AdminParkConfigResponse>("/admin/parks", parkId, {
    body: JSON.stringify(request),
    method: "POST"
  });
}

export function updateAdminParkConfig(
  parkId: string,
  request: UpdateParkConfigRequest
) {
  return apiRequest<AdminParkConfigResponse>("/admin/park/profile", parkId, {
    body: JSON.stringify(request),
    method: "PUT"
  });
}

export function updateAdminParkStatus(
  parkId: string,
  targetParkId: string,
  request: AdminStatusRequest
) {
  return apiRequest<AdminParkConfigResponse>(
    `/admin/parks/${targetParkId}/status`,
    parkId,
    {
      body: JSON.stringify(request),
      method: "PATCH"
    }
  );
}

export function deleteAdminPark(parkId: string, targetParkId: string) {
  return apiRequest<DeleteResponse>(`/admin/parks/${targetParkId}`, parkId, {
    method: "DELETE"
  });
}

export function getAdminTicketCatalog(parkId: string) {
  return apiRequest<AdminTicketCatalogResponse>("/admin/ticket-types", parkId);
}

export function createAdminTicketType(
  parkId: string,
  request: CreateTicketTypeRequest
) {
  return apiRequest<AdminTicketTypeResponse>("/admin/ticket-types", parkId, {
    body: JSON.stringify(request),
    method: "POST"
  });
}

export function updateAdminTicketType(
  parkId: string,
  ticketTypeId: string,
  request: UpdateTicketTypeRequest
) {
  return apiRequest<AdminTicketTypeResponse>(
    `/admin/ticket-types/${ticketTypeId}`,
    parkId,
    {
      body: JSON.stringify(request),
      method: "PUT"
    }
  );
}

export function updateAdminTicketTypeStatus(
  parkId: string,
  ticketTypeId: string,
  isActive: boolean
) {
  return apiRequest<AdminTicketTypeResponse>(
    `/admin/ticket-types/${ticketTypeId}/status`,
    parkId,
    {
      body: JSON.stringify({ isActive }),
      method: "PATCH"
    }
  );
}

export function deleteAdminTicketType(parkId: string, ticketTypeId: string) {
  return apiRequest<DeleteResponse>(
    `/admin/ticket-types/${ticketTypeId}`,
    parkId,
    {
      method: "DELETE"
    }
  );
}

export function getAdminOrders(parkId: string) {
  return apiRequest<OrderListResponse>("/admin/orders?page=1&pageSize=50", parkId);
}

export function getAdminUsers(parkId: string) {
  return apiRequest<AdminUsersResponse>("/admin/users?page=1&pageSize=50", parkId);
}
