import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import ProductService from "./product-service";
import { Filter, Product } from "./product-type";
import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import { FileStorage } from "../common/types/storage";
import { AuthRequest } from "../common/types";
import { Roles } from "../common/constants";
import mongoose from "mongoose";

export default class ProductController {
    constructor(
        private ProductService: ProductService,
        private storage: FileStorage,
    ) {}
    // function to create a new product
    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const img = req.files!.image as UploadedFile;
        const imageName = uuidv4();
        await this.storage.upload({
            filename: imageName,
            fileData: img.data.buffer,
        });
        // create product
        // todo => save product to database
        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
        } = req.body as Product;
        const product = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration),
            attributes: JSON.parse(attributes),
            tenantId,
            categoryId,
            // todo => image upload
            image: imageName,
        };
        try {
            const newProduct = await this.ProductService.createProduct(product);
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

    // functions to update product base on access level
    async update(req: Request, res: Response, next: NextFunction) {
        console.log(req.params.id);
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { id } = req.params;
        if (!id) {
            return next(createHttpError(400, "Invalid params."));
        }
        const _product = await this.ProductService.getProduct(id);
        if (!_product) {
            return next(createHttpError(400, "Product not found"));
        }

        if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
            const tenant_id = (req as AuthRequest).auth.tenant;
            if (_product.tenantId !== String(tenant_id)) {
                return next(
                    createHttpError(
                        400,
                        "You are not allowed to acces this product",
                    ),
                );
            }
        }

        let newImage: string | undefined;
        let oldImage: string | undefined;

        if (req.files?.image) {
            oldImage = _product.image;
            const image = req.files?.image as UploadedFile;
            newImage = uuidv4();
            try {
                await this.storage.upload({
                    filename: newImage,
                    fileData: image.data.buffer,
                });
                await this.storage.delete(oldImage as string);
            } catch (error) {
                if (error instanceof Error) {
                    return next(createHttpError(400, error.message));
                }
                return next(
                    createHttpError(
                        400,
                        "Error while cloudinary image processing",
                    ),
                );
            }
        }
        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
        } = req.body as Product;
        const product = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration),
            attributes: JSON.parse(attributes),
            tenantId,
            categoryId,
            // todo => image upload
            image: newImage ? newImage : (oldImage as string),
        };
        try {
            await this.ProductService.updateProduct(id, product);
            res.json({ id });
        } catch (error) {
            if (error instanceof Error) {
                return next(createHttpError(400, error.message));
            }
            return next(
                createHttpError(400, "Error occur while updating product"),
            );
        }
    }

    // function to get list of product
    async getList(req: Request, res: Response, next: NextFunction) {
        const { q, tenantId, categoryId, isPublish } = req.query;

        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, "Internal server error"));
        }
        const filters: Filter = {};

        if (isPublish === "true") filters.isPublish = true;
        if (tenantId) filters.tenantId = tenantId as string;
        if (
            categoryId &&
            mongoose.Types.ObjectId.isValid(categoryId as string)
        ) {
            filters.categoryId = new mongoose.Types.ObjectId(
                categoryId as string,
            );
        }
        try {
            const productList = await this.ProductService.getProducts(
                q as string,
                filters,
            );
            res.json(productList);
        } catch (error) {
            if (error instanceof Error) {
                return next(createHttpError(400, error.message));
            }
            return next(createHttpError(400, "Interval server error"));
        }
    }
}
