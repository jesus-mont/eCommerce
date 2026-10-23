package com.eCommerce.api.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class  RabbitMQConfig {

    public static final String PURCHASE_EXCHANGE = "ecommerce.purchase.exchange";
    public static final String PURCHASE_QUEUE = "ecommerce.purchase.queue";
    public static final String PURCHASE_ROUTING_KEY = "purchase.order.created";

    @Bean
    public TopicExchange purchaseExchange() {
        return new TopicExchange(PURCHASE_EXCHANGE, true, false);
    }

    @Bean
    public Queue purchaseQueue() {
        return new Queue(PURCHASE_QUEUE, true);
    }

    @Bean
    public Binding purchaseBinding(Queue purchaseQueue, TopicExchange purchaseExchange) {
        return BindingBuilder.bind(purchaseQueue).to(purchaseExchange).with(PURCHASE_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }
}