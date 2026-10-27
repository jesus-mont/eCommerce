package com.eCommerce.api.config;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class RabbitMQConfigTest {
    private final RabbitMQConfig config = new RabbitMQConfig();

    @Test
    void declaresDurablePurchaseExchangeQueueAndBinding() {
        TopicExchange exchange = config.purchaseExchange();
        Queue queue = config.purchaseQueue();
        Binding binding = config.purchaseBinding(queue, exchange);

        assertEquals(RabbitMQConfig.PURCHASE_EXCHANGE, exchange.getName());
        assertTrue(exchange.isDurable());
        assertEquals(RabbitMQConfig.PURCHASE_QUEUE, queue.getName());
        assertTrue(queue.isDurable());
        assertEquals(RabbitMQConfig.PURCHASE_QUEUE, binding.getDestination());
        assertEquals(RabbitMQConfig.PURCHASE_ROUTING_KEY, binding.getRoutingKey());
    }

    @Test
    void configuresJsonMessageConversionForRabbitTemplate() {
        Jackson2JsonMessageConverter converter = (Jackson2JsonMessageConverter) config.jsonMessageConverter();
        RabbitTemplate template = config.rabbitTemplate(mock(ConnectionFactory.class), converter);

        assertSame(converter, template.getMessageConverter());
    }
}
