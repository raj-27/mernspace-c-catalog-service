import { NextFunction, Response } from "express";
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
import { Logger } from "winston";
import { MessageProducerBroker } from "../common/types/broker";
import { Request } from "express-jwt";
import { mapToObject } from "../util";

export default class ProductController {
    constructor(
        private ProductService: ProductService,
        private storage: FileStorage,
        private logger: Logger,
        private broker: MessageProducerBroker,
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
            isPublish,
        } = req.body as Product;
        const product = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration) as string,
            attributes: JSON.parse(attributes) as string,
            tenantId,
            categoryId,
            // todo => image upload
            image: imageName,
            isPublish,
        };
        try {
            const newProduct = await this.ProductService.createProduct(product);

            // Send product to kafka
            // Todo : mover topic name to config
            await this.broker.sendMessage(
                "product",
                JSON.stringify({
                    id: newProduct._id,
                    // Todo: Fix the typescript error
                    priceConfiguration: mapToObject(
                        newProduct.priceConfiguration as unknown as Map<
                            string,
                            any
                        >,
                    ),
                }),
            );
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
                await this.storage.delete(oldImage);
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
            isPublish,
        } = req.body as Product;
        const product = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration) as string,
            attributes: JSON.parse(attributes) as string,
            tenantId,
            categoryId,
            // todo => image upload
            image: newImage ? newImage : (oldImage as string),
            isPublish,
        };
        try {
            const updatedProduct = await this.ProductService.updateProduct(
                id,
                product,
            );

            // Send product to kafka
            // Todo : move topic name to the config
            await this.broker.sendMessage(
                "product",
                JSON.stringify({
                    id: updatedProduct?._id,
                    // Todo: Fix the typescript error
                    priceConfiguration: mapToObject(
                        updatedProduct?.priceConfiguration as unknown as Map<
                            string,
                            any
                        >,
                    ),
                }),
            );
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
        const { q, tenantId, categoryId, isPublish, page, limit } = req.query;

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
                {
                    page: parseInt(page as string) || 1,
                    limit: parseInt(limit as string) || 10,
                },
            );
            const finalProducts = (productList.data as Product[]).map(
                (product: Product) => {
                    return {
                        ...product,
                        image: this.storage.getObjectUri(product.image),
                    };
                },
            );

            res.json({
                data: finalProducts,
                total: productList.total,
                pageSize: productList.pageSize,
                currentPage: productList.currentPage,
            });
        } catch (error) {
            if (error instanceof Error) {
                return next(createHttpError(400, error.message));
            }
            return next(createHttpError(400, "Interval server error"));
        }
    }

    // Function to get product by id
    async getProductById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const product = await this.ProductService.getProduct(id);
            if (!product) {
                return next(createHttpError(400, `Product  not found`));
            }
            res.json(product);
        } catch (error) {
            if (error instanceof Error) {
                return next(createHttpError(400, error.message));
            }
            return next(createHttpError(400, "Internal server error"));
        }
    }

    // Function to delete a product by id
    async deleteProductById(req: Request, res: Response, next: NextFunction) {
        try {
            const { productId } = req.params;
            const product = await this.ProductService.getProduct(productId);
            if (!product) {
                return next(createHttpError(400, `Product not found`));
            }
            if ((req as AuthRequest).auth.role != Roles.ADMIN) {
                const tenant_id = (req as AuthRequest).auth.tenant;
                if (tenant_id != product.tenantId) {
                    return next(
                        createHttpError(
                            400,
                            "You are not allowed to acces this product",
                        ),
                    );
                }
            }

            // delete image reference with this product
            try {
                await this.storage.delete(product.image);
            } catch (error) {
                return next(
                    createHttpError(400, "Error while deleting product image"),
                );
            }
            // delete product
            await this.ProductService.deleteProduct(productId);
            // send response to client
            res.json({ id: productId });
        } catch (error) {
            if (error instanceof Error) {
                return next(createHttpError(400, error.message));
            }
            return next(createHttpError(400, "Internal server error"));
        }
    }
}
