import type { Request, Response } from "express";
import { getHomeContent } from "../services/home-content.service";

export function getHome(_req: Request, res: Response) {
  res.json(getHomeContent());
}
