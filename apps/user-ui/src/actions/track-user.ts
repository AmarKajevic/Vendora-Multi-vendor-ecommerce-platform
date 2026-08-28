"use server"
import { kafka } from "packages/utils/kafka"

const producer = kafka.producer()

export async function sendKafkaEvent(eventData: {
    userId?: string;
    productId?: string;
    shopId?: string;
    action: string;
    device?: string;
    country?: string;
    city?: string;
}) {
    console.log("📨 sendKafkaEvent called with:", eventData);
    try {
        await producer.connect();
        console.log("✅ Kafka producer connected");
        await producer.send({
            topic: "users-events",
            messages: [{ value: JSON.stringify(eventData) }]
        });
        console.log("✅ Kafka message sent");
    } catch (error) {
        console.error("❌ Kafka send error:", error);
    } finally {
        await producer.disconnect();
        console.log("🔌 Kafka producer disconnected");
    }
}