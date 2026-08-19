package com.ventas.orders.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class ProductEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(ProductEventConsumer.class);

    @KafkaListener(topics = "product-events", groupId = "order-service", properties = {"spring.json.value.default.type=java.util.HashMap"})
    public void consumeProductEvent(Map<String, Object> event) {
        String eventType = (String) event.get("event");
        log.info("Received product event: {} from Kafka", eventType);
    }
}
