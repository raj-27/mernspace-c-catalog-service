import express, { NextFunction, Request, Response } from "express";
import authenticate from "../common/middleware/authenticate";
import canAccess from "../common/middleware/canAccess";
import { Roles } from "../common/constants";
import ProductController from "./product-controller";
import createProductValidator from "./product-validator";
import ProductService from "./product-service";
import { CloudinaryStorage } from "../common/service/CloudinaryStorage";
import productUpdateValidator from "./product-update-validator";
import logger from "../config/logger";
import FileUploadMiddleware from "../common/middleware/fileUpload";
import { createMessageProducerBroker } from "../common/factories/brokerFactory";

const productService = new ProductService();
const cloudinaryStorage = new CloudinaryStorage();
const broker = createMessageProducerBroker();
const productControler = new ProductController(
    productService,
    cloudinaryStorage,
    logger,
    broker,
);
const router = express.Router();

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    FileUploadMiddleware(3),
    createProductValidator,
    (req: Request, res: Response, next: NextFunction) =>
        productControler.create(req, res, next),
);

router.put(
    "/:id",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    FileUploadMiddleware(3),
    productUpdateValidator,
    (req: Request, res: Response, next: NextFunction) =>
        productControler.update(req, res, next),
);

router.get("/", (req: Request, res: Response, next: NextFunction) =>
    productControler.getList(req, res, next),
);

router.get("/:id", (req: Request, res: Response, next: NextFunction) =>
    productControler.getProductById(req, res, next),
);

router.delete(
    "/:productId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    (req: Request, res: Response, next: NextFunction) =>
        productControler.deleteProductById(req, res, next),
);

export default router;
