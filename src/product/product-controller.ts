import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import ProductService from "./product-service";
import { Product } from "./product-type";
import cloudinary, {
    CloudinaryStorage,
} from "../common/service/CloudinaryStorage";
import path from "path";
import { FileData } from "../common/types/storage";
import { UploadedFile } from "express-fileupload";

export default class ProductController {
    constructor(
        private ProductServuce: ProductService,
        private CloudinaryService: CloudinaryStorage,
    ) {}
    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const file = req.files;
        const img = req.files!.image as UploadedFile;
        const fileName = img.name;
        const bufferData = img.data.buffer;
        const imageUrl = await this.CloudinaryService.upload({
            filename: fileName,
            fileData: bufferData,
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
            image: imageUrl,
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
