import type { Request, Response } from "express";
import {
  getGuestPurchaseNotice,
  getPurchaseMethodOptions
} from "../services/purchase-method.service";

export function getPurchaseMethods(_req: Request, res: Response) {
  res.json(getPurchaseMethodOptions());
}

export function getGuestNotice(_req: Request, res: Response) {
  res.json(getGuestPurchaseNotice());
}
