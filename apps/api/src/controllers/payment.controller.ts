import type { Request, Response } from "express";
import type { CreateOrderPaymentRequest } from "@packages/shared-types";
import { sendOrderError } from "./orders.controller";
import {
  createSuccessfulPayment,
  getPaymentMethods,
  getPaymentSuccessSummary
} from "../services/payment.service";
import { OrderServiceError } from "../services/orders.service";

export function getPaymentMethodsController(_req: Request, res: Response) {
  res.json(getPaymentMethods());
}

export async function createOrderPaymentController(req: Request, res: Response) {
  try {
    const result = await createSuccessfulPayment(
      getRouteParam(req.params.orderId),
      req.body as CreateOrderPaymentRequest
    );

    res.json(result);
  } catch (error) {
    sendOrderError(res, error);
  }
}

function getRouteParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

export async function getPaymentSuccessSummaryController(
  req: Request,
  res: Response
) {
  try {
    const orderId = req.query.orderId;

    if (typeof orderId !== "string" || !orderId.trim()) {
      throw new OrderServiceError(
        "ORDER_ID_REQUIRED",
        "orderId query parameter is required.",
        400
      );
    }

    res.json(await getPaymentSuccessSummary(orderId));
  } catch (error) {
    sendOrderError(res, error);
  }
}
