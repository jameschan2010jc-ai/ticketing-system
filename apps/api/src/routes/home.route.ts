import { Router } from "express";
import { getHome } from "../controllers/home.controller";

const homeRouter = Router();

homeRouter.get("/home-content", getHome);

export default homeRouter;
