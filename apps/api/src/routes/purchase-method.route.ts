import { Router } from "express";
import {
  getGuestNotice,
  getPurchaseMethods
} from "../controllers/purchase-method.controller";

const purchaseMethodRouter = Router();

purchaseMethodRouter.get("/purchase-method/options", getPurchaseMethods);
purchaseMethodRouter.get("/purchase-method/guest-notice", getGuestNotice);

export default purchaseMethodRouter;
