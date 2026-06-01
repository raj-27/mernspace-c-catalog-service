import express, { NextFunction, Request, Response } from "express";
import ToppingController from "./topping-controller";
import ToppingService from "./topping-service";
import authenticate from "../common/middleware/authenticate";
import canAccess from "../common/middleware/canAccess";
import { Roles } from "../common/constants";
import { CloudinaryStorage } from "../common/service/CloudinaryStorage";
import createToppingValidator from "./create-topping-validator";
import FileUploadMiddleware from "../common/middleware/fileUpload";
import updateToppingValidator from "./update-topping-validator";
import { createMessageProducerBroker } from "../common/factories/brokerFactory";
import logger from "../config/logger";

const toppingService = new ToppingService();
const cloudinaryStorage = new CloudinaryStorage(logger);
const broker = createMessageProducerBroker();
const toppingController = new ToppingController(
    toppingService,
    cloudinaryStorage,
    broker,
    logger,
);

const router = express.Router();

router.post(
    "/",
    authenticate,
    FileUploadMiddleware(3),
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    createToppingValidator,
    (req: Request, res: Response, next: NextFunction) =>
        toppingController.create(req, res, next),
);

router.put(
    "/:toppingId",
    authenticate,
    FileUploadMiddleware(3),
    updateToppingValidator,
    (req: Request, res: Response, next: NextFunction) =>
        toppingController.update(req, res, next),
);

router.get("/", (req: Request, res: Response, next: NextFunction) =>
    toppingController.getList(req, res, next),
);

router.get("/:toppingId", (req: Request, res: Response, next: NextFunction) =>
    toppingController.getTopping(req, res, next),
);

router.delete(
    "/:toppingId",
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        toppingController.delete(req, res, next),
);

export default router;
