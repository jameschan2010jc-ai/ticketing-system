import type { Request, Response } from "express";
import type { PurchaseContentConfirmRequest } from "@packages/shared-types";
import {
  confirmPurchaseContent,
  getPurchaseContentOptions
} from "../services/purchase-content.service";

export async function getPurchaseOptions(req: Request, res: Response) {
  res.json(await getPurchaseContentOptions(req.header("x-park-id") ?? "demo-park"));
}

export async function confirmPurchase(req: Request, res: Response) {
  try {
    const result = await confirmPurchaseContent(
      req.body as PurchaseContentConfirmRequest,
      req.header("x-park-id") ?? "demo-park"
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

    if (message === "VISIT_SLOT_NOT_AVAILABLE") {
      res.status(409).json({
        code: "VISIT_SLOT_NOT_AVAILABLE",
        message: "Selected visit date or entry time is not available."
      });
      return;
    }

    res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Unable to confirm purchase content."
    });
  }
}
