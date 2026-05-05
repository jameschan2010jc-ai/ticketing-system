import { Router } from "express";
import {
  createParkConfigController,
  createTicketTypeController,
  deleteParkConfigController,
  deleteTicketTypeController,
  getParkConfigController,
  listParksController,
  listTicketTypesController,
  updateParkConfigController,
  updateParkStatusController,
  updateTicketTypeStatusController,
  updateTicketTypeController
} from "../controllers/admin-config.controller";

const adminConfigRouter = Router();

adminConfigRouter.get("/admin/parks", listParksController);
adminConfigRouter.post("/admin/parks", createParkConfigController);
adminConfigRouter.patch("/admin/parks/:parkId/status", updateParkStatusController);
adminConfigRouter.delete("/admin/parks/:parkId", deleteParkConfigController);
adminConfigRouter.get("/admin/park/profile", getParkConfigController);
adminConfigRouter.put("/admin/park/profile", updateParkConfigController);
adminConfigRouter.get("/admin/ticket-types", listTicketTypesController);
adminConfigRouter.post("/admin/ticket-types", createTicketTypeController);
adminConfigRouter.patch(
  "/admin/ticket-types/:ticketTypeId/status",
  updateTicketTypeStatusController
);
adminConfigRouter.put(
  "/admin/ticket-types/:ticketTypeId",
  updateTicketTypeController
);
adminConfigRouter.delete(
  "/admin/ticket-types/:ticketTypeId",
  deleteTicketTypeController
);

export default adminConfigRouter;
