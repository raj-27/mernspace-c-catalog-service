import app from "./app";
import logger from "./config/logger";
import config from "config";

const startServer = () => {
    const PORT: number = config.get("server.port") || 5510;
    try {
        app.listen(PORT, () => logger.info(`listening on port ${PORT}`));
    } catch (err) {
        if (err instanceof Error) {
            logger.error(err?.message);
            setTimeout(() => {
                process.exit();
            }, 1000);
        }
    }
};

startServer();
