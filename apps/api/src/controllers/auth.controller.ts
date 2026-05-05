import type { Request, Response } from "express";
import type {
  LoginExistingAccountRequest,
  RegisterUserRequest
} from "@packages/shared-types";
import {
  createUser,
  findUserByAccount,
  listUsers
} from "../repositories/user.repository";

export async function registerUserController(req: Request, res: Response) {
  const request = req.body as RegisterUserRequest;

  if (!request.account || !request.password || !request.verificationCode) {
    res.status(400).json({
      code: "REGISTRATION_INVALID",
      message: "Account, verification code, and password are required."
    });
    return;
  }

  res.status(201).json({
    data: await createUser(request),
    success: true
  });
}

export async function loginExistingAccountController(req: Request, res: Response) {
  const request = req.body as LoginExistingAccountRequest;

  if (!request.account || !request.password) {
    res.status(400).json({
      code: "LOGIN_INVALID",
      message: "Account and password are required."
    });
    return;
  }

  const user = await findUserByAccount(request.account);

  if (!user) {
    res.status(404).json({
      code: "USER_NOT_FOUND",
      message: "Account not found."
    });
    return;
  }

  res.json({
    data: user,
    success: true
  });
}

export async function listAdminUsersController(req: Request, res: Response) {
  res.json(
    await listUsers(
      req.header("x-park-id") ?? "demo-park",
      getPositiveInt(req.query.page, 1),
      getPositiveInt(req.query.pageSize, 20)
    )
  );
}

function getPositiveInt(value: unknown, fallback: number) {
  if (typeof value !== "string") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
