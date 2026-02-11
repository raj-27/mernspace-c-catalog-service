import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    defaultMeta: {
        serviceName: "catalog-service",
        environment: process.env.NODE_ENV, // dev / staging / production
        version: process.env.npm_package_version, // app version
        hostname: require("os").hostname(), // container or machine host
        pid: process.pid, // process ID
        instanceId: process.env.INSTANCE_ID || null, // for horizontal scaling
    },
    transports: [
        new winston.transports.File({
            dirname: "logs",
            filename: "app.log",
            level: "debug",
            silent: false,
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
            silent: false,
        }),
    ],
});

export default logger;
