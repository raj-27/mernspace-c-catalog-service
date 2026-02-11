import app from "./app";
import { createMessageProducerBroker } from "./common/factories/brokerFactory";
// import { createMessageProducerBroker } from "./common/factories/brokerFactory";
import { MessageProducerBroker } from "./common/types/broker";
import { Config } from "./config";
import { initDb } from "./config/db";
import logger from "./config/logger";

const startServer = async () => {
    console.log(Number(Config.PORT), Config.KAFKA_BROKERS);
    const PORT: number = Number(Config.PORT) || 5510;
    let MessageProducerBroker: MessageProducerBroker | null = null;
    try {
        await initDb();
        logger.info("Database connected successfully");
        // Connect to kafka
        MessageProducerBroker = createMessageProducerBroker();
        await MessageProducerBroker.connect();
        app.listen(PORT, () => logger.info(`listening on port ${PORT}`));
    } catch (err) {
        if (err instanceof Error) {
            if (MessageProducerBroker) {
                await MessageProducerBroker.disconnect();
            }
            logger.error(err?.message);
            setTimeout(() => {
                process.exit();
            }, 1000);
        }
    }
};

void startServer();
