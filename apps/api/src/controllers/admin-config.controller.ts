import type { Request, Response } from "express";
import type {
  AdminStatusRequest,
  CreateParkConfigRequest,
  CreateTicketTypeRequest,
  UpdateParkConfigRequest,
  UpdateTicketTypeRequest
} from "@packages/shared-types";
import {
  createParkConfig,
  createTicketType,
  deleteParkConfig,
  deleteTicketType,
  getParkConfig,
  listParks,
  listTicketTypes,
  setParkStatus,
  setTicketTypeStatus,
  updateParkConfig,
  updateTicketType
} from "../repositories/admin-config.repository";

export async function listParksController(_req: Request, res: Response) {
  res.json({
    items: await listParks()
  });
}

export async function getParkConfigController(req: Request, res: Response) {
  const park = await getParkConfig(getParkId(req));

  if (!park) {
    res.status(404).json({
      code: "PARK_NOT_FOUND",
      message: "Park not found."
    });
    return;
  }

  res.json({
    data: park
  });
}

export async function createParkConfigController(req: Request, res: Response) {
  try {
    const park = await createParkConfig(req.body as CreateParkConfigRequest);

    res.status(201).json({
      data: park
    });
  } catch (error) {
    sendAdminConfigError(res, error);
  }
}

export async function updateParkConfigController(req: Request, res: Response) {
  try {
    const park = await updateParkConfig(
      getParkId(req),
      req.body as UpdateParkConfigRequest
    );

    res.json({
      data: park
    });
  } catch (error) {
    sendAdminConfigError(res, error);
  }
}

export async function updateParkStatusController(req: Request, res: Response) {
  try {
    const request = req.body as AdminStatusRequest;
    const park = await setParkStatus(
      getRouteParam(req.params.parkId),
      request.status
    );

    res.json({
      data: park
    });
  } catch (error) {
    sendAdminConfigError(res, error);
  }
}

export async function deleteParkConfigController(req: Request, res: Response) {
  try {
    await deleteParkConfig(getRouteParam(req.params.parkId));

    res.json({
      success: true
    });
  } catch (error) {
    sendAdminConfigError(res, error);
  }
}

export async function listTicketTypesController(req: Request, res: Response) {
  res.json({
    items: await listTicketTypes(getParkId(req), true)
  });
}

export async function createTicketTypeController(req: Request, res: Response) {
  try {
    const ticket = await createTicketType(
      getParkId(req),
      req.body as CreateTicketTypeRequest
    );

    res.status(201).json({
      data: ticket
    });
  } catch (error) {
    sendAdminConfigError(res, error);
  }
}

export async function updateTicketTypeController(req: Request, res: Response) {
  try {
    const ticket = await updateTicketType(
      getParkId(req),
      getRouteParam(req.params.ticketTypeId),
      req.body as UpdateTicketTypeRequest
    );

    res.json({
      data: ticket
    });
  } catch (error) {
    sendAdminConfigError(res, error);
  }
}

export async function updateTicketTypeStatusController(
  req: Request,
  res: Response
) {
  try {
    const request = req.body as { isActive: boolean };
    const ticket = await setTicketTypeStatus(
      getParkId(req),
      getRouteParam(req.params.ticketTypeId),
      request.isActive
    );

    res.json({
      data: ticket
    });
  } catch (error) {
    sendAdminConfigError(res, error);
  }
}

export async function deleteTicketTypeController(req: Request, res: Response) {
  try {
    await deleteTicketType(getParkId(req), getRouteParam(req.params.ticketTypeId));

    res.json({
      success: true
    });
  } catch (error) {
    sendAdminConfigError(res, error);
  }
}

function getParkId(req: Request) {
  return req.header("x-park-id") ?? "demo-park";
}

function getRouteParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

function sendAdminConfigError(res: Response, error: unknown) {
  if (isDuplicateKeyError(error)) {
    res.status(409).json({
      code: "ADMIN_CONFIG_DUPLICATE",
      message: "A record with this identifier already exists."
    });
    return;
  }

  if (error instanceof Error && error.message === "TICKET_TYPE_NOT_FOUND") {
    res.status(404).json({
      code: "TICKET_TYPE_NOT_FOUND",
      message: "Ticket type not found."
    });
    return;
  }

  if (error instanceof Error && error.message === "PARK_NOT_FOUND") {
    res.status(404).json({
      code: "PARK_NOT_FOUND",
      message: "Park not found."
    });
    return;
  }

  res.status(500).json({
    code: "ADMIN_CONFIG_ERROR",
    message: "Unable to process admin configuration request."
  });
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ER_DUP_ENTRY"
  );
}
