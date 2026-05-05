import { Router } from "express";
import {
  createOrderPaymentController,
  getPaymentMethodsController,
  getPaymentSuccessSummaryController
} from "../controllers/payment.controller";

const paymentRouter = Router();

paymentRouter.get("/payment/methods", getPaymentMethodsController);
paymentRouter.post("/orders/:orderId/payments", createOrderPaymentController);
paymentRouter.get(
  "/payment/success-summary",
  getPaymentSuccessSummaryController
);

export default paymentRouter;
