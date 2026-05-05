import type { Request, Response } from "express";
import type {
  CreateOrderRequest,
  OrderStatus,
  PaymentMethod
} from "@packages/shared-types";
import {
  createPendingOrder,
  getAdminOrders,
  getMyOrders,
  getMyTickets,
  getOrder,
  OrderServiceError
} from "../services/orders.service";

export async function createOrderController(req: Request, res: Response) {
  try {
    const order = await createPendingOrder(req.body as CreateOrderRequest, {
      parkId: getParkId(req),
      userId: getUserId(req)
    });

    res.status(201).json({
      data: order,
      success: true
    });
  } catch (error) {
    sendOrderError(res, error);
  }
}

export async function getOrderController(req: Request, res: Response) {
  try {
    const order = await getOrder(getRouteParam(req.params.orderId));

    res.json({
      data: order
    });
  } catch (error) {
    sendOrderError(res, error);
  }
}

export async function getMyOrdersController(req: Request, res: Response) {
  try {
    const result = await getMyOrders(
      getUserId(req),
      getPositiveInt(req.query.page, 1),
      getPositiveInt(req.query.pageSize, 20)
    );

    res.json(result);
  } catch (error) {
    sendOrderError(res, error);
  }
}

export async function getMyTicketsController(req: Request, res: Response) {
  try {
    const result = await getMyTickets(
      getUserId(req),
      getPositiveInt(req.query.page, 1),
      getPositiveInt(req.query.pageSize, 20)
    );

    res.json(result);
  } catch (error) {
    sendOrderError(res, error);
  }
}

export async function getAdminOrdersController(req: Request, res: Response) {
  try {
    const result = await getAdminOrders(
      getParkId(req),
      {
        createdFrom: getOptionalQuery(req.query.createdFrom),
        createdTo: getOptionalQuery(req.query.createdTo),
        orderNo: getOptionalQuery(req.query.orderNo),
        paymentMethod: getOptionalQuery(req.query.paymentMethod) as
          | PaymentMethod
          | undefined,
        status: getOptionalQuery(req.query.status) as OrderStatus | undefined,
        userKeyword: getOptionalQuery(req.query.userKeyword),
        visitDate: getOptionalQuery(req.query.visitDate)
      },
      getPositiveInt(req.query.page, 1),
      getPositiveInt(req.query.pageSize, 20)
    );

    res.json(result);
  } catch (error) {
    sendOrderError(res, error);
  }
}

export async function getAdminOrderController(req: Request, res: Response) {
  return getOrderController(req, res);
}

function getRouteParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

function getParkId(req: Request) {
  return req.header("x-park-id") ?? "demo-park";
}

function getUserId(req: Request) {
  return req.header("x-demo-user-id") ?? "demo-user";
}

function getOptionalQuery(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getPositiveInt(value: unknown, fallback: number) {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function sendOrderError(res: Response, error: unknown) {
  if (error instanceof OrderServiceError) {
    res.status(error.status).json({
      code: error.code,
      message: error.message
    });
    return;
  }

  if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
    res.status(404).json({
      code: "ORDER_NOT_FOUND",
      message: "Order not found."
    });
    return;
  }

  res.status(500).json({
    code: "ORDER_SERVICE_ERROR",
    message: "Unable to process order request."
  });
}
