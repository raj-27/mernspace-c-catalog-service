import { NextFunction, Request, Response } from "express";
import ToppingService from "./topping-service";
import { Filter, Topping } from "./topping-type";
import createHttpError from "http-errors";
import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import { FileStorage } from "../common/types/storage";
import { validationResult } from "express-validator";
import { AuthRequest } from "../common/types";
import { Roles } from "../common/constants";

export default class ToppingController {
    constructor(
        private ToppingService: ToppingService,
        private storage: FileStorage,
    ) {}

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const result = validationResult(req);
            if (!result.isEmpty()) {
                return next(
                    createHttpError(400, result.array()[0].msg as string),
                );
            }
            const { name, price, tenantId, isPublish } = req.body as Topping;

            if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
                const _tenantId = (req as AuthRequest).auth.tenant;
                if (_tenantId != tenantId) {
                    return next(
                        createHttpError(
                            400,
                            "You are not allowed to perform this action",
                        ),
                    );
                }
            }

            const img = req.files!.image as UploadedFile;
            const imageName = uuidv4();
            await this.storage.upload({
                filename: imageName,
                fileData: img.data,
            });
            const topping = await this.ToppingService.create({
                name,
                image: imageName,
                price,
                tenantId,
                isPublish,
            });
            res.json({ id: topping._id });
        } catch (error) {
            if (error instanceof Error) {
                return next(createHttpError(400, error.message));
            }
            return next(createHttpError(400, "Internal server error"));
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const result = validationResult(req);
            if (!result.isEmpty()) {
                return next(
                    createHttpError(400, result.array()[0].msg as string),
                );
            }
            const { toppingId } = req.params;
            const { name, price, tenantId, isPublish } = req.body as Topping;

            if (!toppingId) {
                return next(createHttpError(400, "Invalid params."));
            }
            if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
                const tenant_id = (req as AuthRequest).auth.tenant;
                if (tenantId !== String(tenant_id)) {
                    return next(
                        createHttpError(
                            400,
                            "You are not allowed to acces this product",
                        ),
                    );
                }
            }
            const topping = await this.ToppingService.getTopping(toppingId);
            if (!topping) {
                return next(createHttpError(400, "Topping not found"));
            }

            let oldImage: string | undefined;
            let newImage: string | undefined;
            if (req.files?.image) {
                oldImage = topping.image;
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
            const newTopping = {
                name,
                price,
                tenantId,
                isPublish,
                image: newImage ? newImage : (oldImage as string),
            };
            const updatedTopping = await this.ToppingService.update(
                toppingId,
                newTopping,
            );
            res.json({ id: updatedTopping?.id as string });
        } catch (error) {
            if (error instanceof Error) {
                return next(createHttpError(400, error.message));
            }
            return next(createHttpError(400, "Internal server error"));
        }
    }

    async getList(req: Request, res: Response, next: NextFunction) {
        try {
            const { q, tenantId, isPublish, page, limit } = req.query;
            const filter: Filter = {};
            if (isPublish === "true") filter.isPublish = true;
            if (tenantId) filter.tenantId = tenantId as string;

            const toppingList = await this.ToppingService.getList(
                q as string,
                filter,
                {
                    page: parseInt(page as string) || 1,
                    limit: parseInt(limit as string) || 10,
                },
            );

            const finalToppings = (toppingList.data as Topping[]).map(
                (topping: Topping) => {
                    return {
                        ...topping,
                        image: this.storage.getObjectUri(topping.image),
                    };
                },
            );
            return res.json({
                data: finalToppings,
                total: toppingList.total,
                pageSize: toppingList.pageSize,
                currentPage: toppingList.currentPage,
            });
        } catch (error) {
            if (error instanceof Error) {
                return next(createHttpError(400, error.message));
            }
            return next(createHttpError(400, "Internal server error"));
        }
    }

    async getTopping(req: Request, res: Response, next: NextFunction) {
        try {
            const { toppingId } = req.params;
            const topping = await this.ToppingService.getTopping(toppingId);
            res.json(topping);
        } catch (error) {
            if (error instanceof Error) {
                return next(createHttpError(400, error.message));
            }
            return next(createHttpError(400, "Internal server error"));
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { toppingId } = req.params;
            // 1st fetch product
            const topping = await this.ToppingService.getTopping(toppingId);
            if (!topping) {
                return next(createHttpError(400, "Topping not found"));
            }
            // topping can only be delete topping creator or admin i.e topping created by tenant or admin
            if ((req as AuthRequest).auth.role != Roles.ADMIN) {
                const _tenant = (req as AuthRequest).auth.tenant;
                if (_tenant.toString() !== topping.tenantId) {
                    return next(
                        createHttpError(
                            400,
                            "You are not allowed to perform this action",
                        ),
                    );
                }
            }

            // if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
            //     const tenant_id = (req as AuthRequest).auth.tenant;
            //     if (tenantId !== String(tenant_id)) {
            //         return next(
            //             createHttpError(
            //                 400,
            //                 "You are not allowed to acces this product",
            //             ),
            //         );
            //     }
            // }
            // get topping name to delete toppoing image
            try {
                await this.storage.delete(topping.image);
            } catch (error) {
                return next(
                    createHttpError(400, "Error while deleting topping image"),
                );
            }
            // delete topping detail from database
            await this.ToppingService.delete(toppingId);
            // return response
            res.json({ id: toppingId });
        } catch (error) {
            if (error instanceof Error) {
                return next(createHttpError(400, error.message));
            }
            return next(createHttpError(400, "Internal server error"));
        }
    }
}
