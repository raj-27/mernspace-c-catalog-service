import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import logger from "../config/logger";

export default async function globalErrorHandler(
    err: HttpError,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const isProduction = process.env.NODE_ENV === "production";
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: req.path,
                location: "server",
                stack: isProduction ? null : err.stack,
            },
        ],
    });
}
