import type { Request, Response } from "express";
import type { PurchaseContentConfirmRequest } from "@packages/shared-types";
import {
  confirmPurchaseContent,
  getPurchaseContentOptions
} from "../services/purchase-content.service";

export function getPurchaseOptions(_req: Request, res: Response) {
  res.json(getPurchaseContentOptions());
}

export function confirmPurchase(req: Request, res: Response) {
  try {
    const result = confirmPurchaseContent(
      req.body as PurchaseContentConfirmRequest
    );

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "VALIDATION_ERROR";

    if (message === "TICKET_NOT_AVAILABLE") {
      res.status(409).json({
        code: "TICKET_NOT_AVAILABLE",
        message: "Selected ticket is no longer available."
      });
      return;
    }

    if (message === "INVALID_QUANTITY") {
      res.status(400).json({
        code: "INVALID_QUANTITY",
        message: "Max 1 ticket per order is allowed."
      });
      return;
    }

    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Unable to confirm purchase content."
    });
  }
}
