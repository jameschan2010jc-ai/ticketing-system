import { Router } from "express";
import {
  confirmPurchase,
  getPurchaseOptions
} from "../controllers/purchase-content.controller";

const purchaseContentRouter = Router();

purchaseContentRouter.get("/purchase-content/options", getPurchaseOptions);
purchaseContentRouter.post("/purchase-content/confirm", confirmPurchase);

export default purchaseContentRouter;
