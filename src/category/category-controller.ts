import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Category } from "./category-types";
import CategoryService from "./category-service";
import { Logger } from "winston";

export default class CategoryController {
    constructor(
        private categoryService: CategoryService,
        private logger: Logger,
    ) {}
    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            console.log(result.array());
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { name, priceConfiguration, attributes } = req.body as Category;
        try {
            const category = await this.categoryService.create({
                name,
                priceConfiguration,
                attributes,
            });
            this.logger.info(`Category created,Category id :${category._id}}`);
            res.json({ category_id: category._id });
        } catch (error) {
            return next(createHttpError(400, "Error while creating category"));
        }
    }
}
