package com.ventas.products.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class ProductEventProducer {

    private static final Logger log = LoggerFactory.getLogger(ProductEventProducer.class);
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.enabled:false}")
    private boolean kafkaEnabled;

    public ProductEventProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendProductEvent(String event, Object product) {
        if (!kafkaEnabled) {
            log.debug("Kafka disabled, skipping event: {}", event);
            return;
        }
        try {
            Map<String, Object> payload = Map.of("event", event, "product", product);
            kafkaTemplate.send("product-events", event, payload);
            log.info("Kafka event sent: {} for product", event);
        } catch (Exception e) {
            log.warn("Failed to send Kafka event: {}", e.getMessage());
        }
    }
}
