import { v2 as cloudinary } from "cloudinary";
import { FileData, FileStorage } from "../types/storage";
import createHttpError from "http-errors";
import { Readable } from "stream";
import { Config } from "../../config/index";
import { Logger } from "winston";

cloudinary.config({
    cloud_name: Config.CLOUDINARY_NAME,
    api_secret: Config.CLOUDINARY_SECRET,
    api_key: Config.CLOUDINARY_KEY,
});

export default cloudinary;

export class CloudinaryStorage implements FileStorage {
    constructor(private logger: Logger) {}

    async upload(data: FileData): Promise<void> {
        const { fileData, filename } = data;

        try {
            this.logger.info("Starting image upload", { filename });

            let bufferData: Buffer;

            // 🔹 Case 1: Already Buffer
            if (Buffer.isBuffer(fileData)) {
                bufferData = fileData;
            }

            // 🔹 Case 2: number[]
            else if (Array.isArray(fileData)) {
                bufferData = Buffer.from(fileData);
            }

            // 🔹 Case 3: { data: number[] }
            else if (
                typeof fileData === "object" &&
                fileData !== null &&
                "data" in fileData &&
                Array.isArray((fileData as any).data)
            ) {
                bufferData = Buffer.from((fileData as any).data);
            }

            // 🔹 Case 4: base64 string
            else if (typeof fileData === "string") {
                const base64Data = fileData.replace(
                    /^data:image\/\w+;base64,/,
                    "",
                );
                bufferData = Buffer.from(base64Data, "base64");
            } else {
                this.logger.warn("Unsupported file format", {
                    type: typeof fileData,
                });
                throw createHttpError(400, "Invalid image file");
            }

            await new Promise<void>((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        public_id: `product-image/${filename}`,
                        resource_type: "image",
                    },
                    (error, result) => {
                        if (error) {
                            return reject(createHttpError(400, error.message));
                        }
                        resolve();
                    },
                );

                Readable.from(bufferData).pipe(stream);
            });
        } catch (error: any) {
            this.logger.error("Upload failed", { error: error.message });
            throw createHttpError(
                error.status || 500,
                error.message || "Image upload failed",
            );
        }
    }

    async delete(filename: string): Promise<void> {
        await cloudinary.uploader.destroy(filename);
    }
    async getObjectUri(filename: string): Promise<string> {
        try {
            const imageUrl = cloudinary.url(
                `product-image/${filename.split(".")[0]}`,
                { secure: true },
            );
            return imageUrl;
        } catch (error) {
            throw new Error("Invalid cloudinary configuration or filename");
        }
    }
}
