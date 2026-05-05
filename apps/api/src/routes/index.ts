import { Router } from "express";
import adminConfigRouter from "./admin-config.route";
import authRouter from "./auth.route";
import healthRouter from "./health.route";
import homeRouter from "./home.route";
import ordersRouter from "./orders.route";
import paymentRouter from "./payment.route";
import purchaseContentRouter from "./purchase-content.route";
import purchaseMethodRouter from "./purchase-method.route";

const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(homeRouter);
apiRouter.use(purchaseMethodRouter);
apiRouter.use(purchaseContentRouter);
apiRouter.use(ordersRouter);
apiRouter.use(paymentRouter);
apiRouter.use(authRouter);
apiRouter.use(adminConfigRouter);

export default apiRouter;
