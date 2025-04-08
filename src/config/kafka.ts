import { Kafka, Producer } from "kafkajs";
import { MessageProducerBroker } from "../common/types/broker";

export class KafkaProducerBroker implements MessageProducerBroker {
    private producer: Producer;

    constructor(clientId: string, brokers: string[]) {
        const kafka = new Kafka({ clientId, brokers });
        this.producer = kafka.producer();
    }

    /**
     * Connect the producer
     */
    async connect() {
        await this.producer.connect();
    }

    /**
     * Disconnect the producer
     */
    async disconnect() {
        if (this.producer) {
            await this.producer.disconnect();
        }
    }

    /**
     * @param topic - the topic to send the message to
     * @param message - the message to send
     * @throws {Error}- when the producer is not connected
     */
    async sendMessage(topic: string, message: string, key?: string) {
        const data: { value: string; key?: string } = {
            value: message,
        };
        if (key) {
            data.key = key;
        }
        if (this.producer) {
            await this.producer.send({
                topic,
                messages: [data],
            });
        }
    }
}
