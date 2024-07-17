import express, { NextFunction, Request, Response } from "express";
import CategoryController from "./category-controller";
import CategoryService from "./category-service";
import categoryValidator from "./category-validator";
import logger from "../config/logger";
import authenticate from "../common/middleware/authenticate";
import canAccess from "../common/middleware/canAccess";
import { Roles } from "../common/constants";

const router = express.Router();
const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService, logger);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    categoryValidator,
    (req: Request, res: Response, next: NextFunction) =>
        categoryController.create(req, res, next),
);

export default router;
