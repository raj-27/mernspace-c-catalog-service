import { v2 as cloudinary } from "cloudinary";
import { FileData, FileStorage } from "../types/storage";
import config from "config";
import createHttpError from "http-errors";
import { Readable } from "stream";

cloudinary.config({
    cloud_name: config.get("cloudinary.cloud_name"),
    api_secret: config.get("cloudinary.api_secret"),
    api_key: config.get("cloudinary.api_key"),
});

export default cloudinary;

export class CloudinaryStorage implements FileStorage {
    async upload(data: FileData): Promise<void> {
        const { fileData, filename } = data;
        const bufferData = Buffer.from(fileData);
        return new Promise((resolve, reject) => {
            // Create a readable stream from the buffer
            const readableStream = new Readable();
            readableStream.push(bufferData);
            readableStream.push(null); // Indicate end of the stream
            const stream = cloudinary.uploader.upload_stream(
                {
                    public_id: `product-image/${filename.split(".")[0]}`,
                    resource_type: "image",
                },
                (err, res) => {
                    if (err) {
                        throw createHttpError(400, err.message);
                    }
                    resolve();
                },
            );
            readableStream.pipe(stream);
        });
    }
    async delete(filename: string): Promise<void> {
        return await cloudinary.uploader.destroy(filename);
    }
    async getObjectUri(filename: string): Promise<string> {
        return new Promise((res, rej) => {});
        // Your logic here
    }
}
