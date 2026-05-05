import { Router } from "express";
import {
  listAdminUsersController,
  loginExistingAccountController,
  registerUserController
} from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/auth/login-existing-account", loginExistingAccountController);
authRouter.post("/auth/register/phone/complete", registerUserController);
authRouter.post("/auth/register/email/complete", registerUserController);
authRouter.get("/admin/users", listAdminUsersController);

export default authRouter;
