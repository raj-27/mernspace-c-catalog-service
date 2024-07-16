import { NextFunction, Request, Response } from "express";

export default class CategoryController {
    async create(req: Request, res: Response, next: NextFunction) {
        res.json({
            msg: "hello",
        });
    }
}
