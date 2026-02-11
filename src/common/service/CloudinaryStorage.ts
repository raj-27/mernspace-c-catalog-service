import { v2 as cloudinary } from "cloudinary";
import { FileData, FileStorage } from "../types/storage";
import createHttpError from "http-errors";
import { Readable } from "stream";
import { Config } from "../../config/index";

cloudinary.config({
    cloud_name: Config.CLOUDINARY_NAME,
    api_secret: Config.CLOUDINARY_SECRET,
    api_key: Config.CLOUDINARY_KEY,
});

export default cloudinary;

export class CloudinaryStorage implements FileStorage {
    async upload(data: FileData): Promise<void> {
        const { fileData, filename } = data;

        const bufferData = Buffer.from(fileData.toString());
        return new Promise((resolve) => {
            // Create a readable stream from the buffer
            const readableStream = new Readable();
            readableStream.push(bufferData);
            readableStream.push(null); // Indicate end of the stream
            void cloudinary.uploader
                .upload(`image/${filename}.jpg`)
                .then()
                .catch();

            const stream = cloudinary.uploader.upload_stream(
                {
                    public_id: `product-image/${filename.split(".")[0]}`,
                    resource_type: "image",
                },
                (err) => {
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
