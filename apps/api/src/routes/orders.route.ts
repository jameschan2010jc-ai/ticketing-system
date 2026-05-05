import { Router } from "express";
import {
  createOrderController,
  getAdminOrderController,
  getAdminOrdersController,
  getMyOrdersController,
  getMyTicketsController,
  getOrderController
} from "../controllers/orders.controller";

const ordersRouter = Router();

ordersRouter.post("/orders", createOrderController);
ordersRouter.get("/orders/my", getMyOrdersController);
ordersRouter.get("/tickets/my", getMyTicketsController);
ordersRouter.get("/orders/:orderId", getOrderController);
ordersRouter.get("/admin/orders", getAdminOrdersController);
ordersRouter.get("/admin/orders/:orderId", getAdminOrderController);

export default ordersRouter;
