import { config } from "dotenv";
import path from "path";

config({
    path: path.join(__dirname, `../../.env.${process.env.NODE_ENV ?? "dev"}`),
});

const {
    PORT,
    NODE_ENV,
    DATABASE_URL,
    JWKS_URI,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    KAFKA_BROKERS,
    KAFKA_PRODUCT_TOPIC,
    KAFKA_SASL_USERNAME,
    KAFKA_SASL_PASSWORD,
    KAFKA_SASL_MECHANISM,
    CLIENT_UI_URL,
    ADMIN_UI_URL,
    REFRESH_TOKEN_SECRET,
} = process.env;

export const Config = {
    PORT: PORT || 5002,
    NODE_ENV,
    DATABASE_URL,
    JWKS_URI,
    // Cloudinary
    CLOUDINARY_NAME: CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_KEY: CLOUDINARY_API_KEY,
    CLOUDINARY_SECRET: CLOUDINARY_API_SECRET,
    // Kafka
    KAFKA_BROKERS: KAFKA_BROKERS ? KAFKA_BROKERS.split(",") : [], // Converts string to array
    KAFKA_PRODUCT_TOPIC,
    KAFKA_SASL_USERNAME,
    KAFKA_SASL_PASSWORD,
    KAFKA_SASL_MECHANISM,
    // Frontend
    CLIENT_UI: CLIENT_UI_URL,
    ADMIN_UI: ADMIN_UI_URL,
    REFRESH_TOKEN_SECRET,
};
