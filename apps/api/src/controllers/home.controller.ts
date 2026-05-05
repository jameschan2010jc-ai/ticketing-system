import type { Request, Response } from "express";
import { getHomeContent } from "../services/home-content.service";

export async function getHome(req: Request, res: Response) {
  res.json(await getHomeContent(req.header("x-park-id") ?? "demo-park"));
}
