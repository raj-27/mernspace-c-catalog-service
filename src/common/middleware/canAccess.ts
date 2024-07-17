import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { AuthRequest } from "../types";

export default function canAccess(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const _req = req as AuthRequest;
        const fromToken = _req.auth.role;
        if (!roles.includes(fromToken)) {
            const error = createHttpError(
                403,
                "You dont have enough permission",
            );
            next(error);
            return;
        }
        next();
    };
}
