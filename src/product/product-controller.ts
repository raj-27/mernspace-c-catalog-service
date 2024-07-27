import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import ProductService from "./product-service";
import { Product } from "./product-type";

export default class ProductController {
    constructor(private ProductServuce: ProductService) {}
    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        // create product
        // todo => save product to database
        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            image,
        } = req.body as Product;
        const product = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration),
            attributes: JSON.parse(attributes),
            tenantId,
            categoryId,
            // todo => image upload
            image: "image.png",
        };
        try {
            const newProduct = await this.ProductServuce.createProduct(product);
            // todo => send response
            res.json({ id: newProduct._id });
        } catch (error) {
            if (error instanceof Error) {
                return next(createHttpError(400, error.message));
            }
            return next(
                createHttpError(400, "Error while creating new product"),
            );
        }
    }
}
