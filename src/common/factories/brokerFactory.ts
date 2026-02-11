import config from "config";
import { MessageProducerBroker } from "../types/broker";
import { KafkaProducerBroker } from "../../config/kafka";
import { Config } from "../../config";

let messageProducer: MessageProducerBroker | null = null;

export const createMessageProducerBroker = (): MessageProducerBroker => {
    // Making singletons
    if (!messageProducer) {
        messageProducer = new KafkaProducerBroker(
            "catalog-service",
            Config.KAFKA_BROKERS,
        );
    }
    return messageProducer;
};
