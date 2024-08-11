import express, { NextFunction, Request, Response } from "express";
import authenticate from "../common/middleware/authenticate";
import canAccess from "../common/middleware/canAccess";
import { Roles } from "../common/constants";
import ProductController from "./product-controller";
import createProductValidator from "./product-validator";
import ProductService from "./product-service";
import fileUpload from "express-fileupload";
import createHttpError from "http-errors";
import { CloudinaryStorage } from "../common/service/CloudinaryStorage";
import productUpdateValidator from "./product-update-validator";

const productService = new ProductService();
const cloudinaryStorage = new CloudinaryStorage();
const productControler = new ProductController(
    productService,
    cloudinaryStorage,
);
const router = express.Router();

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 3 * 1024 * 1024 },
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "File Exceed the limit");
            next(error);
        },
        // info when i comment below two option then only getting buffer data
        // useTempFiles: true,
        // tempFileDir: path.join(__dirname, "../../public/data/uploads"),
    }),
    createProductValidator,
    (req: Request, res: Response, next: NextFunction) =>
        productControler.create(req, res, next),
);

router.put(
    "/:id",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fileSize: 3 * 1024 * 1024 },
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "File Exceed the limit");
            next(error);
        },
        // info when i comment below two option then only getting buffer data
        // useTempFiles: true,
        // tempFileDir: path.join(__dirname, "../../public/data/uploads"),
    }),
    productUpdateValidator,
    (req: Request, res: Response, next: NextFunction) =>
        productControler.update(req, res, next),
);

router.put("/:id");

export default router;
