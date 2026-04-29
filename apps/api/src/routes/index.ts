import { Router } from "express";
import healthRouter from "./health.route";
import homeRouter from "./home.route";
import purchaseContentRouter from "./purchase-content.route";
import purchaseMethodRouter from "./purchase-method.route";

const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(homeRouter);
apiRouter.use(purchaseMethodRouter);
apiRouter.use(purchaseContentRouter);

export default apiRouter;
