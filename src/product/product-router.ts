import express, { NextFunction, Request, Response } from "express";
import authenticate from "../common/middleware/authenticate";
import canAccess from "../common/middleware/canAccess";
import { Roles } from "../common/constants";
import ProductController from "./product-controller";
import createProductValidator from "./product-validator";
import ProductService from "./product-service";
import fileUpload from "express-fileupload";

const productService = new ProductService();
const productControler = new ProductController(productService);
const router = express.Router();

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    fileUpload(),
    createProductValidator,
    (req: Request, res: Response, next: NextFunction) =>
        productControler.create(req, res, next),
);

export default router;
