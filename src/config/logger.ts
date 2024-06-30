import winston from "winston";
import { Config } from ".";

const logger = winston.createLogger({
    level: "info",
    defaultMeta: {
        serviceName: "catalog-service",
    },
    transports: [
        new winston.transports.File({
            dirname: "logs",
            filename: "app.log",
            level: "debug",
            silent: !(Config.NODE_ENV === "test"),
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
        }),
        new winston.transports.File({
            dirname: "logs",
            filename: "error.log",
            level: "error",
            silent: false,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
        }),
        new winston.transports.Console({
            level: "info",
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
            silent: Config.NODE_ENV === "test",
        }),
    ],
});

export default logger;
