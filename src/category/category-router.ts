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

// route for creating new categories
router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    categoryValidator,
    (req: Request, res: Response, next: NextFunction) =>
        categoryController.create(req, res, next),
);

// route for getting list of categories
router.get("/", (req: Request, res: Response, next: NextFunction) =>
    categoryController.getCategories(req, res, next),
);

// route for getting category by id
router.get("/:id", (req: Request, res: Response, next: NextFunction) =>
    categoryController.getCategoryById(req, res, next),
);

// router for deleting category by id
router.delete(
    "/:id",
    authenticate,
    canAccess([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        categoryController.deleteCategoryById(req, res, next),
);

// router for updating category by id
router.patch(
    "/:id",
    authenticate,
    canAccess([Roles.ADMIN]),
    categoryValidator,
    (req: Request, res: Response, next: NextFunction) =>
        categoryController.updateCategory(req, res, next),
);

export default router;
