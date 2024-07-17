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
            if (error instanceof Error) {
                return next(createHttpError(400, error.message));
            }
            return next(createHttpError(400, "Error while creating category"));
        }
    }

    async getCategories(req: Request, res: Response, next: NextFunction) {
        try {
            const categories = await this.categoryService.getAll();
            res.json({ categories, count: categories.length });
        } catch (error) {
            if (error instanceof Error) {
                return next(createHttpError(400, error.message));
            }
            return next(createHttpError(400, "Internal server error"));
        }
    }

    async getCategoryById(req: Request, res: Response, next: NextFunction) {
        try {
            const categoryId = req.params.id;
            if (!categoryId) {
                return next(createHttpError(400, "Invalid params"));
            }
            const category =
                await this.categoryService.getCategoryById(categoryId);
            res.json(category);
        } catch (error) {
            if (error instanceof Error) {
                return next(createHttpError(400, error.message));
            }
            return next(createHttpError(400, "Internal server error"));
        }
    }

    async deleteCategoryById(req: Request, res: Response, next: NextFunction) {
        const categoryId = req.params.id;
        if (!categoryId) {
            return next(createHttpError(400, "Invalid params"));
        }
        try {
            await this.categoryService.deleteCategoryById(categoryId);
            res.json({
                message: `Category with id:${categoryId} deleted successfully`,
            });
        } catch (error) {
            if (error instanceof Error) {
                return next(createHttpError(400, error.message));
            }
            return next(createHttpError(400, "Internal server error"));
        }
    }

    async updateCategory(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, "Internal server error"));
        }
        const { name, priceConfiguration, attributes } = req.body as Category;
        const categoryId = req.params.id;
        try {
            const category = await this.categoryService.updateCategory(
                { name, priceConfiguration, attributes },
                categoryId,
            );

            res.json({ id: category?._id });
        } catch (error) {
            if (error instanceof Error) {
                return next(createHttpError(400, error.message));
            }
            return next(createHttpError(400, "Internal server error"));
        }
    }
}
