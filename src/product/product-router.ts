import express, { NextFunction, Request, Response } from "express";
import authenticate from "../common/middleware/authenticate";
import canAccess from "../common/middleware/canAccess";
import { Roles } from "../common/constants";
import ProductController from "./product-controller";
import createProductValidator from "./product-validator";

const productControler = new ProductController();
const router = express.Router();

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    createProductValidator,
    (req: Request, res: Response, next: NextFunction) =>
        productControler.create(req, res, next),
);

export default router;
