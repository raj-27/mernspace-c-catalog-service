import fileUpload from "express-fileupload";
import createHttpError from "http-errors";

export default function FileUploadMiddleware(maxFileSize: number) {
    return fileUpload({
        limits: { fileSize: maxFileSize * 1024 * 1024 },
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "File exceeds the limit");
            next(error);
        },
    });
}
