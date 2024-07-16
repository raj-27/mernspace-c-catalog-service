import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from "express";
import CategoryController from "./category-controller";
import CategoryService from "./category-service";
import categoryValidator from "./category-validator";
import logger from "../config/logger";
import createHttpError from "http-errors";
import authenticate from "../common/middleware/authenticate";

const asyncWrapper = async (requestHandler: RequestHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            if (err instanceof Error) {
                return next(createHttpError(400, err.message));
            }
            return next(createHttpError(400, "Internal Server error"));
        });
    };
};

const router = express.Router();
const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService, logger);

router.post(
    "/",
    authenticate,
    categoryValidator,
    (req: Request, res: Response, next: NextFunction) =>
        categoryController.create(req, res, next),
);

export default router;
